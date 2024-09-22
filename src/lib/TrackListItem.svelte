<script lang="ts">
import { convertFileSrc } from "@tauri-apps/api/core";
import { currentDragging, draggingOrigin, playlistPath } from "../ts/Stores";
import { join } from "@tauri-apps/api/path";
import { onMount } from "svelte";

export let entry: any;
export let ctx: AudioContext;
export let masterGain: GainNode;

let self: HTMLElement;
let dragging = false;
let playing = false;
let hover = false;
let node: AudioBufferSourceNode | null = null;

function handleDragStart(e: any) {
	e.dataTransfer.dropEffect = "copy";
	e.dataTransfer.setData("text/plain", "placehold");
	$currentDragging = entry;
	$draggingOrigin = "src";
	dragging = true;
	//console.log("drag start", $currentDragging);
}

function handleDragEnd(e: any) {
	dragging = false;
	//console.log("end dragging", e);
}

async function handlePlay(e: any) {
	if (playing) {
		playing = false;
		node!.stop();
		node = null;
	} else {
		playing = true;
		const response = await fetch(
			convertFileSrc(await join($playlistPath, entry.path)),
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

onMount(() => {
	console.log(entry);
});
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
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
