<script lang="ts">
import { DropHandler } from "@/ts/Utils";
import {
	editMode,
	selectedItem,
	isEditing,
	currentDragging,
	draggingOrigin,
	settings,
} from "../ts/Stores.svelte";
import { onMount } from "svelte";
import Annotation from "./Annotation.svelte";
import type { PlaylistItem } from "@/ts/Types";

interface Props {
	track: PlaylistItem;
	id: number;
}
let { track = $bindable(), id }: Props = $props();

let dragging = false;
let dragover: "top" | "bottom" | "content" | null = null;
let titleEl: HTMLElement;

function handleDragStart(e: DragEvent) {
	//calc pointer position
	const target = e.target as HTMLElement;
	let rec = target.getBoundingClientRect();
	let x = e.clientX - rec.left;

	//drag if pointer on drag area
	if (x < 80) {
		const dataTransfer = e.dataTransfer as DataTransfer;
		dataTransfer.dropEffect = "copy";
		dataTransfer.setData("text/plain", "placehold");
		$currentDragging = track;
		$draggingOrigin = "playlist";
		dragging = true;
	} else {
		e.preventDefault();
	}
}

function handleDragEnd(e: any) {
	dragging = false;
}

function handleDrop(e: DragEvent) {
	e.preventDefault();
	e.stopPropagation();

	const target = e.target as HTMLElement;
	let rec = target.getBoundingClientRect();
	let y = e.clientY - rec.top;
	if (y < 40) {
		let newPosition = id;
		DropHandler(newPosition);
	} else if ($currentDragging?.type == "image") {
		track.items?.push({
			type: "image",
			path: $currentDragging.path,
			pathSource: $currentDragging.pathSource,
		});
	} else {
		let newPosition = id + 1;
		DropHandler(newPosition);
	}

	track = track;
}

function handleDragEnter(e: DragEvent) {
	const target = e.target as HTMLElement;
	let rec = target.getBoundingClientRect();
	let y = e.clientY - rec.top;
	if (y < 40) {
		dragover = "top";
		console.log("drag top");
	} else if ($currentDragging?.type == "image") {
		dragover = "content";
		console.log("drag content");
	} else {
		dragover = "bottom";
		console.log("drag bottom");
	}
}

function handleDragLeave(e: any) {
	dragover = null;
}

export function getBuffer() {}

export function update() {}

export function playPause() {}

export function play() {}

export function stop() {}

onMount(() => {});

$effect(() => {
	$currentDragging == null ? (dragover = null) : null;
});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="playlist-item loop"
	class:selected={$selectedItem == id}
	class:drag-top={dragover == "bottom"}
	class:drag-bottom={dragover == "top"}
	class:drag-content={dragover == "content"}
	draggable={$editMode}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	ondrop={handleDrop}
	ondragenter={handleDragEnter}
	ondragleave={handleDragLeave}
	onclick={e => {
		selectedItem.set(id);
	}}
>
	<div class="drag-area">
		<p>{id + 1}</p>
	</div>

	<!--annotation attached-->
	{#if $settings.showAnnotations}
		<Annotation bind:annotation={track.annotation} {id} />
	{/if}

	<div
		class="inner"
		style={`
			pointer-events: ${$currentDragging == null ? "auto" : "none"};
			height: ${track.items?.length * 32 + 70}rem;
		`}
	>
		<!--reset-btn-->
		<button
			id="btn-reset"
			class="play-btn"
			title="Reset"
			onclick={() => {
				stop(true);
			}}
		>
			<img src="./icons/topbar/reset.svg" alt="" draggable="false" />
		</button>

		<!--play Button-->
		<button
			id="btn-play"
			class="play-btn"
			title="Play"
			class:active={track.playing}
			onclick={playPause}
		>
			{#if track.inFade != null}
				<img
					src="./icons/topbar/fade.svg"
					alt=""
					draggable="false"
					class="fade-state-icon"
				/>
			{:else if track.playing}
				<img src="./icons/topbar/pause.svg" alt="" draggable="false" />
			{:else}
				<img src="./icons/topbar/play.svg" alt="" draggable="false" />
			{/if}
		</button>

		<!--name-->
		<div class="title">
			<input
				bind:this={titleEl}
				onfocus={() => isEditing.update(e => e + 1)}
				onblur={() => isEditing.update(e => e - 1)}
				bind:value={track.name}
				disabled={!$editMode}
			/>
			<div class="title-display">{track.name}</div>
		</div>

		<!--Content-->
		<div class="content">
			{#if track.items}
				{#each track.items as item}
					<div class="loop-item">
						{item.path}
					</div>
				{/each}
			{/if}
			<p class="placeholder">Drop Image or Video to add</p>
		</div>
	</div>
</div>
