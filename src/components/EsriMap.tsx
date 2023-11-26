"use client";

import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Color from "@arcgis/core/Color";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import { useEffect, useRef } from "react";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import ColorVariable from "@arcgis/core/renderers/visualVariables/ColorVariable";
import SizeVariable from "@arcgis/core/renderers/visualVariables/SizeVariable";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Polyline from "@arcgis/core/geometry/Polyline";
import Graphic from "@arcgis/core/Graphic";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import Sketch from "@arcgis/core/widgets/Sketch";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import Circle from "@arcgis/core/geometry/Circle";
import Polygon from "@arcgis/core/geometry/Polygon";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Compass from "@arcgis/core/widgets/Compass";
import { separate } from "@/utils/arcgis/geometryUtils";
import {
	CalciteAction,
	CalciteActionBar,
	CalciteButton,
	CalciteIcon,
	CalcitePanel,
} from "@esri/calcite-components-react";
import { getArcGisApiKey } from "@/arcgis";

import { setAssetPath } from "@esri/calcite-components/dist/components";

setAssetPath("https://unpkg.com/@esri/calcite-components/dist/calcite/assets");

const apiKey = getArcGisApiKey();

export default function EsriMap(props: {
	center: { latitude: number; longitude: number };
	dataUrl: string;
	valueField: string;
	areaField: string;
	areaPerAcre: number;
}) {
	const mapRef = useRef<HTMLDivElement>(null);
	const widgetRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!apiKey) {
			return;
		}

		const visualVariables = [
			new ColorVariable({
				valueExpression: `
					var value = $feature.${props.valueField};
					var acreage = $feature.${props.areaField} / ${props.areaPerAcre};
					if (value > 0 && acreage > 0) {
						return value / acreage;
					} else {
						return null;
					}
				`,

				stops: [
					{
						color: Color.fromArray([255, 255, 255, 0.75]),
						value: 0,
					},
					{
						color: Color.fromArray([127, 127, 127, 0.75]),
						value: 800_000,
					},
					{
						color: Color.fromArray([0, 0, 0, 0.75]),
						value: 5_000_000,
					},
					{
						color: Color.fromArray([255, 0, 0, 0.75]),
						value: 30_000_000,
					},
				],
			}),
			new SizeVariable({
				valueExpression: `$view.scale`,
				target: "outline",
				stops: [
					{ size: 0.5, value: 1000 },
					{ size: 0.5, value: 1001 },
					{ size: 0.1, value: 5000 },
					{ size: 0, value: 10000 },
					{ size: 0, value: 10001 },
				],
			}),
		];

		const renderer = new SimpleRenderer({
			symbol: new SimpleFillSymbol({
				outline: {
					color: Color.fromArray([255, 255, 255, 0.5]),
					width: 0.1,
				},
			}),
			visualVariables,
		});
		const classBreaksRenderer = new ClassBreaksRenderer({
			defaultSymbol: new SimpleFillSymbol({
				style: "solid",
				color: [0, 0, 0, 0],
				outline: {
					color: [0, 0, 0],
				},
			}),
			valueExpression: `
				var value = $feature.${props.valueField};
				var acreage = $feature.${props.areaField} / ${props.areaPerAcre};
				if (value > 0 && acreage > 0) {
					return value / acreage;
				} else {
					return null;
				}
			`,
			defaultLabel: "no data",
			legendOptions: {
				title: "Taxable market value",
			},
			visualVariables: [
				new ColorVariable({
					valueExpression: `
						var value = $feature.${props.valueField};
						var acreage = $feature.${props.areaField} / ${props.areaPerAcre};
						if (value > 0 && acreage > 0) {
							return value / acreage;
						} else {
							return null;
						}
					`,
					stops: [
						{ value: 0, color: [255, 255, 255], label: "$0" },
						{ value: 2_000_000, color: [127, 127, 191], label: "$2M" },
						{ value: 10_000_000, color: [63, 63, 223], label: "$10M" },
					],
				}),
				new SizeVariable({
					valueExpression: `$view.scale`,
					target: "outline",
					stops: [
						{ size: 0.5, value: 1000 },
						{ size: 0.5, value: 1001 },
						{ size: 0.1, value: 5000 },
						{ size: 0, value: 10000 },
						{ size: 0, value: 10001 },
					],
				}),
			],
			classBreakInfos: [
				{
					minValue: 1,
					maxValue: Number.MAX_VALUE,
					symbol: new SimpleFillSymbol({
						style: "solid",
						color: [0, 0, 0, 0],
						outline: {
							color: [0, 0, 0],
						},
					}),
				},
			],
		});

		const labelOptions = {
			minScale: 2000,
		};
		const labelSymbolOptions = {
			color: "white",
			haloColor: "black",
			haloSize: 0.5,
			font: {
				family: "Noto Sans",
				weight: "bold" as const,
			},
		};
		const taxableMarketValueLabel = new LabelClass({
			...labelOptions,
			labelExpressionInfo: {
				expression: `
					var value = $feature.${props.valueField};
					if (value > 0) {
						return Text(value, "$#,###");
					} else {
						return null;
					}
				`,
			},
			symbol: new TextSymbol({
				...labelSymbolOptions,
				yoffset: 10,
			}),
		});
		const acreageLabel = new LabelClass({
			...labelOptions,
			labelExpressionInfo: {
				expression: `
					var acreage = $feature.${props.areaField} / ${props.areaPerAcre};
					if (acreage > 0) {
						return Text(acreage, "#,###.## acres");
					} else {
						return null;
					}
				`,
			},
			symbol: new TextSymbol({
				...labelSymbolOptions,
				yoffset: 0,
			}),
		});
		const valuePerAcreLabel = new LabelClass({
			...labelOptions,
			labelExpressionInfo: {
				expression: `
					var value = $feature.${props.valueField};
					var acreage = $feature.${props.areaField} / ${props.areaPerAcre};
					if (value > 0 && acreage > 0) {
						return Text(value / acreage, "$#,### / acre");
					} else {
						return null;
					}
				`,
			},
			symbol: new TextSymbol({
				...labelSymbolOptions,
				yoffset: -10,
			}),
		});

		const dataUrl = props.dataUrl;
		const featureLayer = new FeatureLayer({
			url: dataUrl,
			renderer: classBreaksRenderer,
			labelingInfo: [taxableMarketValueLabel, acreageLabel, valuePerAcreLabel],
		});

		const polygonSymbol = new SimpleFillSymbol({
			color: [0, 0, 0, 0.25],
			outline: {
				color: [0, 0, 0, 0.75],
				width: 1,
			},
		});
		const polylineSymbol = new SimpleLineSymbol({
			color: [0, 0, 0, 0.75],
			width: 1,
		});

		const graphicsLayer = new GraphicsLayer({});

		const baseLayer = new VectorTileLayer({
			url: "https://www.arcgis.com/sharing/rest/content/items/140be45035d74b5ab4c2a871a8503b84/resources/styles/root.json",
			apiKey,
		});

		const referenceLayer = new VectorTileLayer({
			url: "https://www.arcgis.com/sharing/rest/content/items/615e9eeef23346b3934faa55f834aa6d/resources/styles/root.json",
			apiKey,
		});

		const map = new Map({
			layers: [baseLayer, featureLayer, referenceLayer, graphicsLayer],
		});

		const view = new MapView({
			map,
			zoom: 13,
			container: mapRef.current || undefined,
			center: [props.center.longitude, props.center.latitude],
			constraints: {
				rotationEnabled: true,
			},
		});
		view.ui.add(new Compass({ view }), { position: "top-left" });

		const sketch = new Sketch({
			layer: graphicsLayer,
			view,
			visibleElements: {
				createTools: {},
				selectionTools: {},
			},
		});
		sketch.viewModel.polygonSymbol = polygonSymbol;
		sketch.viewModel.polylineSymbol = polylineSymbol;
		sketch.viewModel.pointSymbol = new SimpleMarkerSymbol({
			color: [0, 0, 0, 0.75],
			size: 1,
		});
		view.ui.add(sketch, { position: "top-right" });

		if (widgetRef.current) {
			view.ui.add(widgetRef.current, { position: "top-right" });
		}

		let highlightSelect: __esri.Handle | null = null;
		view.when().then(() => {
			view.whenLayerView(featureLayer).then((layerView) => {
				reactiveUtils
					.whenOnce(() => !layerView.updating)
					.then(() => {
						let lastPosition: __esri.Point | null = null;
						view.on("drag", (event) => {
							if (event.button !== 0) return;
							event.stopPropagation();

							if (event.action === "end") {
								lastPosition = null;
								return;
							}

							const point = view.toMap(event);

							const draw = geometryEngine.union(
								[
									geometryEngine.buffer(
										lastPosition
											? new Polyline({
													paths: [
														[
															[lastPosition.x, lastPosition.y],
															[point.x, point.y],
														],
													],
											  })
											: point,
										100,
									),
								].flat(),
							);

							switch (event.action) {
								case "start":
									lastPosition = point;
									break;
								case "update":
									lastPosition = point;
									break;
								default:
									lastPosition = null;
							}

							const intersecting = sketch.layer.graphics.filter((graphic) =>
								geometryEngine.intersects(graphic.geometry, draw),
							);
							if (intersecting.length === 1) {
								// If only one intersecting geometry,
								// just update the graphics geometry
								const graphic = intersecting.at(0);
								graphic.geometry = geometryEngine.union([
									graphic.geometry,
									draw,
								]);
							} else {
								// If 0 or more than one intersecting geometries,
								// remove them and merge them into a new one
								sketch.layer.graphics.removeMany(intersecting);
								sketch.layer.graphics.add(
									new Graphic({
										geometry: geometryEngine.union([
											...intersecting
												.map((graphic) => graphic.geometry)
												.toArray(),
											draw,
										]),
										symbol: sketch.viewModel.polygonSymbol,
									}),
								);
							}
						});
						view.on("drag", (event) => {
							if (event.button !== 2) return;
							event.stopPropagation();

							const point = view.toMap(event);

							const circle = new Circle({
								center: point,
								radius: 100,
							});

							sketch.layer.graphics.removeMany(
								sketch.layer.graphics.filter((graphic) =>
									geometryEngine.contains(circle, graphic.geometry),
								),
							);

							sketch.layer.graphics
								.filter((graphic) =>
									geometryEngine.intersects(graphic.geometry, circle),
								)
								.forEach((graphic) => {
									const geometry = geometryEngine.difference(
										graphic.geometry,
										circle,
									);
									if (Array.isArray(geometry)) {
										sketch.layer.graphics.remove(graphic);
										sketch.layer.graphics.addMany(
											geometry.map(
												(geometry) =>
													new Graphic({
														geometry,
														symbol: sketch.viewModel.polygonSymbol,
													}),
											),
										);
									} else {
										const polygon =
											geometry instanceof Polygon
												? (geometry as Polygon)
												: null;
										if (!polygon) return;
										sketch.layer.graphics.remove(graphic);
										sketch.layer.graphics.addMany(
											separate(polygon).map(
												(polygon) =>
													new Graphic({
														geometry: polygon,
														symbol: sketch.viewModel.polygonSymbol,
													}),
											),
										);
									}
								});
						});
						view.on("double-click", (event) => {
							if (event.button !== 0) return;
							event.stopPropagation();

							if (sketch.layer.graphics.length === 0) return;

							featureLayer
								.queryFeatures({
									geometry: geometryEngine.union(
										sketch.layer.graphics
											.map((graphic) => graphic.geometry)
											.toArray(),
									),
									spatialRelationship: "intersects",
									returnGeometry: true,
								})
								.then((featureSet) => {
									console.log(featureSet.features.length);
									// if (highlightSelect) {
									// 	highlightSelect.remove();
									// }
									// highlightSelect = layerView.highlight(featureSet.features);
									// layerView.highlightOptions = {
									// 	haloColor: Color.fromArray([255, 255, 255, 1])
									// };
								});
						});
					});
			});
		});

		return () => {
			view.destroy();
		};
	}, [props, mapRef, widgetRef]);

	return (
		<>
			<div className="h-screen" ref={mapRef}></div>
			<div ref={widgetRef} className="esri-component esri-sketch esri-widget">
				<div className="esri-sketch__panel" role="toolbar">
					<div
						className="esri-sketch__section esri-sketch__tool-section"
						role="menu"
					>
						<CalciteAction title="Draw" text="" appearance="solid" scale="s">
							<CalciteIcon icon="pencil" />
						</CalciteAction>
					</div>
				</div>
			</div>
		</>
	);
}
