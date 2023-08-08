<script lang="ts">
	import { recent } from "@/stores";
	import { onMount } from "svelte";
	import { dataDir } from "@tauri-apps/api/path";
	import { loadRecent, openPlaylist } from "@/utils";

	export let splashScreen;
	let recentList = [];

	onMount(async () => {
		loadRecent();
		recentList = $recent;
		if (recentList.length > 4) recentList.splice(4, recentList.length - 4);
		console.log(recentList);
	});
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="splash"
	on:click={(e) => {
		splashScreen = false;
	}}
>
	<div class="wrapper">
		<img src="./splash.jpg" class="splash-art" />
		<div class="top">
			<img src="./app-icon.png" class="icon" />
			<h1>pure<b>Stage</b></h1>
			<p class="version">0.1 Beta</p>
		</div>

		<div class="container">
			<span>
				<button class="online" on:click={(e) => {}}
					><img src="/icons/square/web.svg" />Website</button
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
						on:click={(e) => {
							e.stopPropagation();
							openPlaylist(item);
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
