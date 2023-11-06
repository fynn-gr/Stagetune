<script lang="ts">
	import { settings } from "@/stores";
	import { onMount } from "svelte";
	import { loadSettings } from "@/saveLoad";
	import { getVersion } from "@tauri-apps/api/app";
	import { Command } from "@tauri-apps/api/shell";

	export let splashScreen;
	let recentList = [];
	let version;

	onMount(async () => {
		//loadSettings();
		recentList = $settings.recent;
		if (recentList.length > 4) recentList.splice(4, recentList.length - 4);
		console.log(recentList);

		let fullVersion = await getVersion();
		version = fullVersion.slice(0, fullVersion.lastIndexOf("."));
	});
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="splash"
	on:click={e => {
		splashScreen = false;
	}}
	on:mousedown={e => {
		splashScreen = false;
	}}
>
	<div class="wrapper">
		<img src="./splash.jpg" class="splash-art" />
		<div class="top">
			<img src="./splash_icon.png" class="icon" />
			<h1><b>Stagetune</b></h1>
			<p class="version">{version || ""} Aquädukt</p>
		</div>

		<div class="container">
			<span>
				<button
					class="online"
					on:click={e => {
						e.preventDefault();
						e.stopPropagation();
						console.log("website");
						new Command("powershell", [
							"/C",
							"start https://github.com/fynn-g/stagetune",
						]);
					}}
				>
					<img src="/icons/square/web.svg" />Website</button
				>
				<button class="online"><img src="/icons/square/web.svg" />Source</button
				>
				<button class="online"
					><img src="/icons/square/web.svg" />Bug Tracker</button
				>
				<button class="online"
					><img src="/icons/square/web.svg" />License</button
				>
			</span>
			<span>
				{#each recentList as item}
					<button
						class="recent"
						on:click={e => {
							e.stopPropagation();
						}}
					>
						<img src="/icons/square/file.svg" />
						{item.split("\\").pop().split("/").pop()}
					</button>
				{/each}
			</span>
		</div>
	</div>
</div>
