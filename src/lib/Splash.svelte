<script lang="ts">
import { settings } from "@/ts/Stores";
import { onMount } from "svelte";
import { getVersion } from "@tauri-apps/api/app";
import { open } from "@tauri-apps/plugin-shell";

const links = {
	Website: "https://fynn.gr/apps/stagetune",
	Repository: "https://github.com/fynn-gr/stagetune",
	License: "https://www.gnu.org/licenses/gpl-3.0.html#license-text",
	BugReport: "https://github.com/fynn-gr/stagetune/issues",
	Documentation: "https://github.com/fynn-gr/stagetune/docs",
};

export let splashScreen;
let version: string;

onMount(async () => {
	//loadSettings();
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
		if (e.target instanceof HTMLButtonElement) return;
		splashScreen = false;
	}}
>
	<div class="wrapper">
		<img src={`./splash_dark.png`} class="splash-art" />
		<!-- <div class="top">
			<h1><b>Stagetune</b></h1>
			<p class="version">{version || ""} Aquädukt</p>
		</div> -->

		<div class="box">
			<span>
				{#each Object.keys(links) as key}
					<button
						title={links[key]}
						on:click={e => {
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
		</div>
	</div>
</div>
