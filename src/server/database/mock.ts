import { data as seedData } from "@/data/seed";
import { Database } from ".";
import { Data } from "..";

const data: ({ id: number } & Data)[] = seedData.map((x, id) => {
	return { id, ...x };
});

export const mockDatabase: Database = {
	async getDataSource(state, county) {
		const results = data.filter((x) => x.state === state && x.county == county);
		const result: Data | null = results[0] || null;
		return result;
	},
};
