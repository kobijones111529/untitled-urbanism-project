import { publicProcedure, router } from "./trpc";
import { z } from "zod";

type Data = {
	id: number;
	center: { latitude: number; longitude: number };
	state: string;
	county: string;
	dataUrl: string;
	valueField: string;
	areaField: string;
	areaPerAcre: number;
};

const data: Data[] = [
	{
		id: 1,
		center: { latitude: 46.7867, longitude: -92.1005 },
		state: "mn",
		county: "st-louis",
		dataUrl:
			"https://gis.stlouiscountymn.gov/server2/rest/services/GeneralUse/OpenData/MapServer/7",
		valueField: "TaxableMarketValue",
		areaField: "ACREAGE",
		areaPerAcre: 1,
	},
	{
		id: 2,
		center: { latitude: 44.9778, longitude: -93.2650 },
		state: "mn",
		county: "hennepin",
		dataUrl:
			"https://gis.hennepin.us/arcgis/rest/services/HennepinData/LAND_PROPERTY/MapServer/1",
		valueField: "TAXABLE_VAL_TOT",
		areaField: "PARCEL_AREA",
		areaPerAcre: 43560,
	},
];

export const appRouter = router({
	getDataSource: publicProcedure
		.input(z.object({ state: z.string(), county: z.string() }))
		.query(async ({ input }): Promise<Data | null> => {
			const results = data.filter(
				(x) => x.state === input.state && x.county == input.county,
			);
			const result: Data | null = results[0] || null;
			return result;
		}),
	getData: publicProcedure.query(async () => {
		return "some data";
	}),
	setData: publicProcedure.input(z.string()).mutation(async ({ input }) => {
		return input;
	}),
});

export type AppRouter = typeof appRouter;
