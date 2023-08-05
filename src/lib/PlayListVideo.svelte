<script lang="ts">
	import { onMount } from "svelte";
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

	const unlisten = listen("video_state", (e: any) => {
		track.state = e.payload.state;
		track.length = e.payload.duration;
		console.log( track.state / track.length)
		//console.log(e, e.payload.buffer.length);
	});

	function handleSkip(e) {
		let rec = e.target.getBoundingClientRect();
		let x = e.clientX - rec.left;
		let perc = Math.min(Math.max(x / rec.width, 0), 1);

		track.playing = false;
		emit("update_play", { action: "skip", position: perc });
	}

	function handleDrop(e) {
		e.preventDefault();
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

	function handleDragStart(e) {
		e.dataTransfer.dropEffect = "copy";
		e.dataTransfer.setData("text/plain", "placehold");
		$currentDragging = track;
		dragging = true;
		console.log("drag start", e);
	}

	function handleDragEnd(e) {
		dragging = false;
		console.log("end dragging", e);
	}

	export function update() { }
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
		<Annotation bind:annotation={track.annotation} {id} start={false} />

		<div class="inner">
			<!--progress-->
			<div
				class="progress"
				on:click={handleSkip}
				style={`
					background: linear-gradient(
						90deg,
						var(--secondary) 0%,
						var(--secondary) calc(100% * ${track.state / track.length}),
						#0002 calc(100% * ${track.state / track.length}),
						#0002 100%
					);`}
			/>

			<!--play Button-->
			<button
				class="play-btn"
				class:active={track.playing}
				on:click={() => {
					if (track.playing) {
						//pause
						emit("update_play", { action: "pause" });
						track.playing = false;
					} else if (track.state > 0) {
						//resume
						emit("update_play", { action: "resume" });
						track.playing = true;
					} else {
						//start
						emit("play_video", { url: track.path });
						track.playing = true;
					}
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
