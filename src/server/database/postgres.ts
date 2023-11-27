import { PrismaClient } from "@prisma/client";
import { Database } from ".";

const prisma = new PrismaClient();

export const postgresDatabase: Database = {
	async getDataSource(state, county) {
		const result = await prisma.map.findFirst({
			where: { state, county },
		});

		if (result === null) return null;

		return {
			id: result.id,
			center: {
				latitude: result.latitude.toNumber(),
				longitude: result.longitude.toNumber(),
			},
			state: result.state,
			county: result.county,
			dataUrl: result.dataUrl,
			valueField: result.valueField,
			areaField: result.areaField,
			areaPerAcre: result.areaPerAcre.toNumber(),
		};
	},
};
