<script lang="ts">
// Svelte, Tauri
import { onDestroy, onMount } from "svelte";
import { emit, listen, type UnlistenFn } from "@tauri-apps/api/event";

// Components
import Annotation from "./Annotation.svelte";

// Stores, Utils
import { DropHandler, updateProjectorList } from "@/ts/Utils";
import type { PlaylistImage } from "@/ts/Types";
import {
	editMode,
	selectedItem,
	isEditing,
	currentDragging,
	draggingOrigin,
	settings,
	playlistZoom,
} from "../ts/Stores.svelte";

interface Props {
	track: PlaylistImage;
	id: number;
}
let { track = $bindable(), id }: Props = $props();

let dragging = false;
let dragover: "top" | "bottom" | null = null;
let titleEl: HTMLElement;
let titleIsEditing = false;

function handleDragStart(e: DragEvent) {
	//calc pointer position
	const target = e.target as HTMLElement;
	let rec = target.getBoundingClientRect();
	let x = e.clientX - rec.left;

	//drag if pointer on drag area
	if (x < 80 && e.dataTransfer) {
		e.dataTransfer.dropEffect = "copy";
		e.dataTransfer.setData("text/plain", "placehold");
		$currentDragging = track;
		$draggingOrigin = "playlist";
		dragging = true;
	} else {
		e.preventDefault();
	}
}

function handleDragEnd(e: DragEvent) {
	dragging = false;
}

function handleDrop(e: DragEvent) {
	e.preventDefault();
	e.stopPropagation();

	const target = e.target as HTMLElement;
	let rec = target.getBoundingClientRect();
	let y = e.clientY - rec.top;
	let newPosition = y > rec.height / 2 ? id + 1 : id;

	DropHandler(newPosition);
}

function handleDragEnter(e: DragEvent) {
	const target = e.target as HTMLElement;
	let rec = target.getBoundingClientRect();
	let y = e.clientY - rec.top;
	dragover = y > rec.height / 2 ? "top" : "bottom";
}

function handleDragLeave() {
	dragover = null;
}

export function play(startTime?: number, useFade?: boolean) {
	emit("play_video", { name: track.name });
	track.playing = true;
}

export function stop(reset?: boolean = false, useFade?: boolean = false) {
	emit("update_play", { action: "stop" });
	track.timeCode = 0;
	track.playing = false;
}

export function playPause() {}

export function getBuffer() {}

export function update() {}

const unlistenState = listen("video_state", (e: any) => {
	if (track.playing && e.payload.name === track.name) {
		track.timeCode = e.payload.state;
	}
});

const unlistenEnd = listen("video_ended", (e: any) => {
	if (e.payload.name === track.name) {
		track.playing = false;
		track.timeCode = 0;
	}
});

onMount(async () => {
	updateProjectorList();
});

$effect(() => {
	$currentDragging == null ? (dragover = null) : null;
});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="playlist-item video"
	class:selected={$selectedItem == id}
	class:missing={track.missing}
	class:drag-top={dragover == "bottom"}
	class:drag-bottom={dragover == "top"}
	draggable={$editMode}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	ondragenter={handleDragEnter}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={e => {
		selectedItem.set(id);
	}}
	tabindex="0"
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
			${$currentDragging == null ? "" : "pointer-events: none;"}
			height: ${$playlistZoom}px;
			padding-left: ${$playlistZoom < 60 ? ($playlistZoom - 40) / 2 : Math.max(($playlistZoom - 60) / 2, 10)}px;
		`}
	>

		<!--reset-btn-->
		{#if $settings.resetButton}
			<button
				class="play-btn"
				title="Reset"
				onclick={() => {
					stop(true);
				}}
			>
				<img src="./icons/topbar/reset.svg" alt="" draggable="false" />
			</button>
		{/if}

		<!--play Button-->
		<button
			class="play-btn"
			title="Play"
			class:active={track.playing}
			onclick={() => play(track.playing)}
		>
			{#if track.playing}
				<img src="./icons/topbar/pause.svg" alt="" draggable="false" />
			{:else}
				<img src="./icons/topbar/play.svg" alt="" draggable="false" />
			{/if}
		</button>

		<!--Title-->
		<div class="title">
			<!--Icon-->
			<img src="./icons/topbar/image.svg" alt="" class="icon" />

			{#if titleIsEditing}
				<input
					class="title-input"
					type="text"
					bind:this={titleEl}
					bind:value={track.name}
					onblur={() => {
						titleIsEditing = false;
						isEditing.update(e => e - 1);
					}}
					onkeydown={e => {
						if (e.key === "Enter") {
							titleIsEditing = false;
						}
					}}
				/>
			{:else}
				<span
					class="title-display"
					ondblclick={() => {
						if (!$editMode) return;
						titleIsEditing = true;
						isEditing.update(e => e + 1);
						tick().then(() => {
							titleEl.focus();
						});
					}}>{track.name}</span
				>
			{/if}
		</div>
	</div>
</div>
