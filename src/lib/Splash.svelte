<script lang="ts">
import { playlistPath, settings } from "@/ts/Stores";
import { onMount } from "svelte";
import { scanSrcPaths } from "@/ts/SaveLoad";
import { getVersion } from "@tauri-apps/api/app";
import { Command } from "@tauri-apps/api/shell";

export let splashScreen;
let recentList = [];
let version: string;

onMount(async () => {
	//loadSettings();
	recentList = $settings.recent;
	console.log("recent: ", recentList);

	let fullVersion = await getVersion();
	version = fullVersion.slice(0, fullVersion.lastIndexOf("."));
});
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="splash"
	on:mousedown={e => {
		splashScreen = false;
	}}
>
	<div class="wrapper">
		<img src="./splash.png" class="splash-art" />
		<div class="top">
			<h1><b>Stagetune</b></h1>
			<p class="version">{version || ""} Aquädukt</p>
		</div>

		<div class="box">
			<span>
				{#each ["Licence", "Repository", "Website", "Bug tracker"] as e}
					<button
						on:click={e => {
							e.stopPropagation();
						}}
					>
						<img src="./icons/std/web.svg" alt="" />
						<p>{e}</p>
					</button>
				{/each}
			</span>
		</div>
	</div>
</div>
