import Polygon from "@arcgis/core/geometry/Polygon";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";

export function separate(geometry: Polygon): Polygon[] {
	const individualRings = geometry.rings
		.map((ring) => {
			const copy = geometry.clone();
			copy.rings = [ring];
			return copy;
		})
		.sort(
			(a, b) =>
				Math.abs(geometryEngine.planarArea(b)) -
				Math.abs(geometryEngine.planarArea(a)),
		);
	return join(individualRings);
}

function join(polygons: Polygon[]): Polygon[] {
	const groups = group(polygons);
	return groups
		.map(({ parent, children }) => {
			const innerGroups = group(children);
			innerGroups.forEach(({ parent: innerParent }) => {
				parent.rings = parent.rings.concat(innerParent.rings);
			});
			return [
				parent,
				...innerGroups.map(({ children }) => join(children)).flat(),
			];
		})
		.flat();
}

function group(
	polygons: Polygon[],
): { parent: Polygon; children: Polygon[] }[] {
	return polygons.reduce(
		(accum, polygon) => {
			for (const { parent, children } of accum) {
				if (geometryEngine.intersects(parent, polygon)) {
					children.push(polygon);
					return accum;
				}
			}
			accum.push({ parent: polygon, children: [] });
			return accum;
		},
		[] as { parent: Polygon; children: Polygon[] }[],
	);
}
