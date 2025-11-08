<script lang="ts">
import { onMount } from "svelte";
import { getVersion } from "@tauri-apps/api/app";
import { open } from "@tauri-apps/plugin-shell";
import { fileNameFromPath } from "@/ts/FileUtils";
import { openPlaylist } from "@/ts/SaveLoad.svelte";
import { paths } from "@/ts/Stores.svelte";

const links: any = {
	Website: "https://fynn.gr/apps/stagetune",
	Repository: "https://github.com/fynn-gr/stagetune",
	BugReport: "https://github.com/fynn-gr/stagetune/issues",
	Documentation: "https://github.com/fynn-gr/stagetune/docs",
};

interface Props {
	splashScreen: boolean;
}
let { splashScreen = $bindable() }: Props = $props();
let version: string = $state("");

onMount(async () => {
	//loadSettings();
	let fullVersion = await getVersion();
	version = fullVersion.slice(0, fullVersion.lastIndexOf("."));
});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_missing_attribute -->
<div
	class="splash"
	onmousedown={e => {
		if (e.target instanceof HTMLButtonElement) return;
		splashScreen = false;
	}}
>
	<div class="wrapper">
		<img src={`./splash_dark.png`} class="splash-art" />

		<div class="box">
			<div class="top">
				<h1><b>Stagetune</b></h1>
				<p class="version">{version || ""} Aquädukt</p>
			</div>

			<span style="left: 0;">
				{#each Object.keys(links) as key}
					<button
						title={links[key]}
						onclick={e => {
							e.stopPropagation();
							console.log("link: ", e);
							open(links[key]);
						}}
					>
						<img src="./icons/std/web.svg" alt="" />
						<p>{key}</p>
					</button>
				{/each}
			</span>
			<span style="right: 0;">
				{#each paths.recent as file}
					<button
						onclick={() => {
							openPlaylist(file);
							splashScreen = false;
						}}
					>
						<img src="./icons/std/file.svg" alt="" />
						<p>{fileNameFromPath(file)}</p>
					</button>
				{/each}
			</span>
		</div>
	</div>
</div>
