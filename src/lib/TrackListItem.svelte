<script lang="ts">
	import { convertFileSrc } from "@tauri-apps/api/tauri";
	import { currentDragging, playlistPath } from "../stores";
	import { join } from "@tauri-apps/api/path";

	export let entry: any;
	export let ctx: AudioContext;
	export let masterGain: GainNode;

	let self: HTMLElement;
	let dragging = false;
	let playing = false;
	let hover = false;
	let node = null;

	function handleDragStart(e) {
		e.dataTransfer.dropEffect = "copy";
		e.dataTransfer.setData("text/plain", "placehold");
		$currentDragging = entry;
		$currentDragging.origin = "src";
		dragging = true;
		//console.log("drag start", e);
	}

	function handleDragEnd(e) {
		dragging = false;
		//console.log("end dragging", e);
	}

	async function handlePlay(e) {
		if (playing) {
			playing = false;
			node.stop();
			node = null;
		} else {
			playing = true;
			const response = await fetch(
				convertFileSrc(await join($playlistPath, entry.path))
			);
			const arrayBuffer = await response.arrayBuffer();
			const buffer = await ctx.decodeAudioData(arrayBuffer);
			node = new AudioBufferSourceNode(ctx, { buffer: buffer });
			node.connect(masterGain);
			node.onended = () => {
				node = null;
				playing = false;
			};
			node.start(0);
		}
	}
</script>

<div
	bind:this={self}
	class="trackListItem"
	class:dragging
	draggable="true"
	on:mouseenter={() => {
		hover = true;
	}}
	on:mouseleave={() => {
		hover = false;
	}}
	on:dragstart={handleDragStart}
	on:dragend={handleDragEnd}
>
	{#if entry.type == "video"}
		<img src="./icons/square/film.svg" alt="" />
	{:else if playing || hover}
		<button class="play-btn" on:click={handlePlay}>
			{#if playing}
				<img src="./icons/square/pause.svg" />
			{:else}
				<img src="./icons/square/play.svg" />
			{/if}
		</button>
	{:else if entry.type == "track"}
		<img src="./icons/square/music.svg" alt="" />
	{/if}
	<p>{entry.name}</p>
</div>
