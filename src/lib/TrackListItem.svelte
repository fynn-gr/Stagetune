<script lang="ts">
import { convertFileSrc } from "@tauri-apps/api/core";
import { currentDragging, draggingOrigin } from "../ts/Stores.svelte";
import { join } from "@tauri-apps/api/path";
import { onMount } from "svelte";

interface Props {
	entry: any;
	ctx: AudioContext;
	masterGain: GainNode;
}
let { entry, ctx, masterGain }: Props = $props();

let self: HTMLElement;
let dragging = $state(false);
let playing = $state(false);
let hover = $state(false);
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
			convertFileSrc(await join(entry.pathSource, entry.path)),
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

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_missing_attribute -->
<div
	bind:this={self}
	class="trackListItem"
	class:dragging
	draggable="true"
	onmouseenter={() => {
		hover = true;
	}}
	onmouseleave={() => {
		hover = false;
	}}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
>
	{#if entry.type == "video"}
		<img src="./icons/top_bar/film.svg" alt="" />
	{:else if entry.type == "image"}
		<img src="./icons/top_bar/image.svg" alt="" />
	{:else if playing || hover}
		<button class="play-btn" onclick={handlePlay}>
			{#if playing}
				<img src="./icons/top_bar/pause.svg" />
			{:else}
				<img src="./icons/top_bar/play.svg" />
			{/if}
		</button>
	{:else if entry.type == "track"}
		<img src="./icons/top_bar/music.svg" alt="" />
	{/if}
	<p>{entry.name}</p>
</div>
