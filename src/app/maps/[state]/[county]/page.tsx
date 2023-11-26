import { serverClient } from "@/app/_trcp/serverClient";
import EsriMap from "@/components/EsriMap";
import { notFound } from "next/navigation";

export default async function Map({
	params: { state, county },
}: {
	params: { state: string; county: string };
}) {
	const data = await serverClient.getDataSource({ state, county });
	if (data === null) {
		return notFound();
	}

	return (
		<EsriMap
			center={data.center}
			dataUrl={data.dataUrl}
			valueField={data.valueField}
			areaField={data.areaField}
			areaPerAcre={data.areaPerAcre}
		/>
	);
}
