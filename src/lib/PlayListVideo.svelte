<script lang="ts">
// Svelte, Tauri
import { onDestroy, onMount } from "svelte";
import { emit, listen, type UnlistenFn } from "@tauri-apps/api/event";

// Components
import Annotation from "./Annotation.svelte";

// Stores, Utils
import { DropHandler, updateProjectorList } from "@/ts/Utils";
import type { PlaylistVideo } from "@/ts/Types";
import {
	editMode,
	selectedItem,
	isEditing,
	currentDragging,
	draggingOrigin,
	settings,
} from "../ts/Stores.svelte";

interface Props {
	track: PlaylistVideo;
	id: number;
}
let { track = $bindable(), id }: Props = $props();

let dragging = false;
let dragover: "top" | "bottom" | null = null;
let titleEl: HTMLElement;
let unlistenState: UnlistenFn;
let unlistenEnd;

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

function handleSkip(e: MouseEvent) {
	if ($settings.allowSkipLive || $editMode) {
		const target = e.target as HTMLElement;
		let rec = target.getBoundingClientRect();
		let x = e.clientX - rec.left;
		let skipFac = Math.min(Math.max(x / rec.width, 0), 1);
		track.playing = false;
		emit("update_play", { action: "skip", position: skipFac });
	}
}

export function playPause() {
	track.playing ? stop() : play((track.state ?? 0) > 0);
}

export function play(resume?: boolean) {
	emit("play_video", { name: track.name });
	track.playing = true;
}

export function stop(reset: boolean = false) {
	emit("update_play", { action: reset ? "pause" : "stop" });
	if (reset) {
		track.state = 0;
		emit("update_play", { action: "skip", position: 0 });
	}
	track.playing = false;
}

export function getBuffer() {}

export function update() {}

onMount(async () => {
	unlistenState = await listen("video_state", (e: any) => {
		if (track.playing && e.payload.name === track.name) {
			track.state = e.payload.state ?? 0;
			track.length = e.payload.duration;
		}
	});

	unlistenEnd = await listen("video_ended", (e: any) => {
		if (e.payload.name === track.name) {
			track.playing = false;
			track.state = 0;
		}
	});

	updateProjectorList();
});

onDestroy(() => {
	unlistenState();
});

$effect(() => {
	$currentDragging == null ? (dragover = null) : null;
});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
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
	role="button"
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
		style={$currentDragging == null ? "" : "pointer-events: none;"}
	>
		<!--progress-->
		<div
			class="progress"
			onclick={handleSkip}
			style={`
					background: linear-gradient(
						90deg,
						var(--accent) 0%,
						var(--accent) calc(100% * ${track.state / track.length || 0}),
						#555 calc(100% * ${track.state / track.length || 0}),
						#555 100%
					);`}
			role="button"
			tabindex="0"
		></div>

		<!--reset-btn-->
		<button
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
			class="play-btn"
			title="Play"
			class:active={track.playing}
			onclick={playPause}
		>
			{#if track.playing}
				<img src="./icons/topbar/pause.svg" alt="" draggable="false" />
			{:else}
				<img src="./icons/topbar/play.svg" alt="" draggable="false" />
			{/if}
		</button>

		<!--Title-->
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
	</div>
</div>
