import { data as seedData } from "@/data/seed";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
	const data: Prisma.MapCreateInput[] = seedData.map(
		({
			center,
			state,
			county,
			dataUrl,
			valueField,
			areaField,
			areaPerAcre,
		}) => {
			return {
				latitude: center.latitude,
				longitude: center.longitude,
				state,
				county,
				dataUrl,
				valueField,
				areaField,
				areaPerAcre,
			};
		},
	);

	await prisma.map.createMany({ data });
}

main()
	.catch((err) => {
		console.error(err);
	})
	.finally(() => {
		prisma.$disconnect();
	});
