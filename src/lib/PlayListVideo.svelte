<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { emit, listen } from "@tauri-apps/api/event";
	import { createPlaylistTrack, secondsToMinutes } from "@/utils";
	import {
		editMode,
		selectedItem,
		isEditing,
		currentDragging,
		playlist,
	} from "../stores";
	import Annotation from "./Annotation.svelte";

	import type { playListItem } from "@/utils";
	import TrackListItem from "./TrackListItem.svelte";

	export let track: playListItem;
	export let id: number;
	let dragging = false;
	let missing = false;
	let unlistenState;

	function handleDragStart(e) {
		let rec = e.target.getBoundingClientRect();
		let x = e.clientX - rec.left;
		if (x < 80) {
			e.dataTransfer.dropEffect = "copy";
			e.dataTransfer.setData("text/plain", "placehold");
			$currentDragging = track;
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
			playlist.update((e) => {
				e.splice(oldPosition, 1);
				e.splice(newPosition, 0, $currentDragging);
				return e;
			});
		} else if ($currentDragging.origin == "src") {
			let newPosition = id;
			playlist.update((e) => {
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
		if (resume) {
			emit("update_play", { action: "resume" });
			track.playing = true;
		} else {
			emit("play_video", { url: track.path });
			track.playing = true;
		}
	}

	export function stop() {
		emit("update_play", { action: "pause" });
		track.playing = false;
	}

	export function update() {}

	onMount(async () => {
		unlistenState = await listen("video_state", (e: any) => {
			if (track.playing) {
				track.state = e.payload.state;
				track.length = e.payload.duration;
				//console.log(track.state / track.length);
				//console.log(e, e.payload.buffer);
			}
		});
	})

	onDestroy(() => {
		unlistenState();
	})
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="playlistVideo"
	class:selected={$selectedItem == id}
	class:editMode={$editMode}
	class:missing
	draggable={$editMode}
	on:dragstart={handleDragStart}
	on:dragend={handleDragEnd}
	on:drop={handleDrop}
	on:click={(e) => {
		selectedItem.set(id);
	}}
>
	<div class="border">
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
						white 0%,
						white calc(100% * ${track.state / track.length}),
						#0002 calc(100% * ${track.state / track.length}),
						#0002 100%
					);`}
			/>

			<div class="drag-area"></div>

			<!--play Button-->
			<button
				class="play-btn"
				class:active={track.playing}
				on:click={() => {
					playPause();
				}}
			>
				{#if track.playing}
					<img src="./icons/square/pause.svg" alt="" />
				{:else}
					<img src="./icons/square/play.svg" alt="" />
				{/if}
			</button>

			<!--set Button-->
			<button
				class="set-btn"
				class:active={false}
				on:click={async () => {
					track.playing = false;
					emit("update_play", { action: "stop" });
				}}
			>
				<img src="./icons/square/stop.svg" alt="" />
			</button>

			<!--Title-->
			<p class="title">{track.name}</p>
		</div>

		<!--annotation after-->
		<Annotation bind:annotation={track.annotation} {id} start={false} />
	</div>
</div>
