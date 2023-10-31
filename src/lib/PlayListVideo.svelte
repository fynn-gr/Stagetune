<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { emit, listen } from "@tauri-apps/api/event";
	import {
		createPlaylistTrack,
		secondsToMinutes,
		updateProjectorList,
	} from "@/utils";
	import {
		editMode,
		selectedItem,
		isEditing,
		currentDragging,
		playlist,
	} from "../stores";
	import Annotation from "./Annotation.svelte";

	import type { playListItem } from "@/utils";

	export let track: playListItem;
	export let id: number;
	let dragging = false;
	let dragover = false;
	let missing = false;
	let unlistenState;
	let unlistenEnd;

	function handleDragStart(e) {
		let rec = e.target.getBoundingClientRect();
		let x = e.clientX - rec.left;
		if (x < 80) {
			e.dataTransfer.dropEffect = "copy";
			e.dataTransfer.setData("text/plain", "placehold");
			$currentDragging = track;
			$currentDragging.origin = "playlist";
			dragging = true;
		} else {
			e.preventDefault();
		}
	}

	function handleDragEnd(e) {
		dragging = false;
		//console.log("end dragging", e);
	}

	function handleDrop(e) {
		e.preventDefault();
		e.stopPropagation();
		if ($currentDragging.origin == "playlist") {
			let oldPosition = $playlist.indexOf($currentDragging);
			let newPosition = id;
			playlist.update(e => {
				e.splice(oldPosition, 1);
				e.splice(newPosition, 0, $currentDragging);
				return e;
			});
		} else if ($currentDragging.origin == "src") {
			let newPosition = id;
			playlist.update(e => {
				e.splice(
					newPosition,
					0,
					createPlaylistTrack(
						"playlist",
						$currentDragging.type,
						$currentDragging.path,
						$currentDragging.name
					)
				);
				return e;
			});
			$selectedItem = newPosition;
		} else {
		}
		$currentDragging = null;
	}

	function handleDragEnter(e) {
		dragover = true;
	}

	function handleDragLeave(e) {
		dragover = false;
	}

	function handleSkip(e) {
		let rec = e.target.getBoundingClientRect();
		let x = e.clientX - rec.left;
		let perc = Math.min(Math.max(x / rec.width, 0), 1);

		track.playing = false;
		emit("update_play", { action: "skip", position: perc });
	}

	export function playPause() {
		if (track.playing) {
			//pause
			stop();
		} else if (track.state > 0) {
			//resume
			play(true);
		} else {
			//start
			play(false);
		}
	}

	export function play(resume: boolean) {
		emit("play_video", { name: track.name });
		track.playing = true;
	}

	export function stop(reset: boolean = false) {
		if (reset) {
			emit("update_play", { action: "pause" });
			track.playing = false;
			track.state = 0;
			emit("update_play", { action: "skip", position: 0 });
			emit("update_play", { action: "stop" });
		} else {
			emit("update_play", { action: "pause" });
			track.playing = false;
		}
	}

	export function update() {}

	onMount(async () => {
		unlistenState = await listen("video_state", (e: any) => {
			console.log(e.payload);
			if (track.playing && e.payload.name == track.name) {
				track.state = e.payload.state;
				track.length = e.payload.duration;
				console.log(track.state / track.length);
			}
		});

		unlistenEnd = await listen("video_ended", (e: any) => {
			if (e.payload.name == track.name) {
				track.playing = false;
				track.state = 0;
			}
		});

		updateProjectorList();
	});

	onDestroy(() => {
		unlistenState();
	});

	$: $currentDragging == null ? (dragover = false) : null;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="playlist-item playlist-video"
	class:selected={$selectedItem == id}
	class:missing
	class:drag-over={dragover}
	draggable={$editMode}
	on:dragstart={handleDragStart}
	on:dragend={handleDragEnd}
	on:dragenter={handleDragEnter}
	on:dragleave={handleDragLeave}
	on:drop={handleDrop}
	on:click={e => {
		selectedItem.set(id);
	}}
>
	<div
		class="border"
		style={$currentDragging == null ? "" : "pointer-events: none;"}
	>
		<!--annotation before-->
		<Annotation bind:annotation={track.annotation} {id} start={true} />

		<div class="inner">
			<!--progress-->
			<div
				class="progress"
				on:click={handleSkip}
				style={`
					background: linear-gradient(
						90deg,
						var(--secondary) 0%,
						var(--secondary) calc(100% * ${track.state / track.length || 0}),
						#555 calc(100% * ${track.state / track.length || 0}),
						#555 100%
					);`}
			/>

			<div class="drag-area">
				<img src="/icons/square/drag_n_drop.svg" alt="" draggable="false" />
			</div>

			<!--reset-btn-->
			<button
				class="play-btn"
				on:click={() => {
					track.playing = false;
					emit("update_play", { action: "stop" });
				}}
			>
				<img src="./icons/square/reset.svg" alt="" draggable="false" />
			</button>

			<!--play Button-->
			<button
				class="play-btn"
				class:active={track.playing}
				on:click={() => {
					playPause();
				}}
			>
				{#if track.playing}
					<img src="./icons/square/pause.svg" alt="" draggable="false" />
				{:else}
					<img src="./icons/square/play.svg" alt="" draggable="false" />
				{/if}
			</button>

			<!--Title-->
			<div class="title">
				<input
					type="text"
					bind:value={track.name}
					on:focus={() => {
						isEditing.update(e => e + 1);
					}}
					on:blur={() => {
						isEditing.update(e => e - 1);
					}}
					disabled={!editMode || $selectedItem != id}
				/>
			</div>
		</div>

		<!--annotation after-->
		<Annotation bind:annotation={track.annotation} {id} start={false} />
	</div>
</div>
