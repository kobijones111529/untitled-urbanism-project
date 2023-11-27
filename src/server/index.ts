import { mockDatabase } from "./database/mock";
import { postgresDatabase } from "./database/postgres";
import { publicProcedure, router } from "./trpc";
import { z } from "zod";

export type Data = {
	center: { latitude: number; longitude: number };
	state: string;
	county: string;
	dataUrl: string;
	valueField: string;
	areaField: string;
	areaPerAcre: number;
};

export const appRouter = router({
	getDataSource: publicProcedure
		.input(z.object({ state: z.string(), county: z.string() }))
		.query(async ({ input }): Promise<Data | null> => {
			return await postgresDatabase.getDataSource(input.state, input.county);
		}),
	getData: publicProcedure.query(async () => {
		return "some data";
	}),
	setData: publicProcedure.input(z.string()).mutation(async ({ input }) => {
		return input;
	}),
});

export type AppRouter = typeof appRouter;
