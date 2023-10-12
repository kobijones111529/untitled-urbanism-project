export function getArcGisApiKey(): string | null {
	return process.env["NEXT_PUBLIC_ARCGIS_API_KEY"] || null;
}
