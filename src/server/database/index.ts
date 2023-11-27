import { Data } from "..";

export type Database = {
	getDataSource: (state: string, county: string) => Promise<Data | null>;
};
