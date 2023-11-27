import { Data } from "@/server";

export const data: Data[] = [
	{
		center: {
			latitude: 46.7867,
			longitude: -92.1005,
		},
		state: "mn",
		county: "st-louis",
		dataUrl:
			"https://gis.stlouiscountymn.gov/server2/rest/services/GeneralUse/OpenData/MapServer/7",
		valueField: "TaxableMarketValue",
		areaField: "ACREAGE",
		areaPerAcre: 1,
	},
	{
		center: {
			latitude: 44.9778,
			longitude: -93.265,
		},
		state: "mn",
		county: "hennepin",
		dataUrl:
			"https://gis.hennepin.us/arcgis/rest/services/HennepinData/LAND_PROPERTY/MapServer/1",
		valueField: "TAXABLE_VAL_TOT",
		areaField: "PARCEL_AREA",
		areaPerAcre: 43560,
	},
];
