import EsriMap from "@/components/EsriMap";
import { serverClient } from "./_trcp/serverClient";
import Link from "next/link";

export default async function Home() {
	return (
		<main className="h-full flex justify-center content-center items-center">
			<div className="h-fit flex justify-center content-center pb-24">
				<h1 className="size-3xl">Find your city</h1>
				<ul>
					<li><Link href="/duluth" /></li>
				</ul>
			</div>
		</main>
	);
}
