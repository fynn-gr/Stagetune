<script lang="ts">
	import { onMount } from "svelte";
	import PlayListTrack from "./PlayListTrack.svelte";
	import type { playListItem } from "@/utils";
	import { selectedItem, editMode, currentDragging, playlist } from "@/stores";

	export let track: playListItem;
	export let id: number;
	export let ctx: AudioContext;
	let dragging = false;

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
				e.splice(newPosition, 0, {
					type: $currentDragging.type,
					origin: "playlist",
					path: $currentDragging.path,
					name: $currentDragging.name,
					playing: false,
					state: 0,
					fade: [0, 0],
					edit: [0, 0],
					annotation: [null, null],
				});
				return e;
			});
			$selectedItem = newPosition;
		} else {
		}
		$currentDragging = null;
	}

	onMount(() => {});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="playlistLoop"
	class:selected={$selectedItem == id}
	class:editMode={$editMode}
	on:dragstart={handleDragStart}
	on:dragend={handleDragEnd}
	on:drop={handleDrop}
	on:click={(e) => {
		selectedItem.set(id);
	}}
>
	<div class="border">
		<div class="container">
			<button class="playBtn">
				<img src="./icons/square/play.svg" alt="play" />
			</button>

			<button class="shuffleBtn">
				<img src="./icons/square/shuffle.svg" alt="shuffle" />
			</button>

			<p class="name">{track.name}</p>

			<div class="content">
				{#each track.tracks as t, i}
					<div class="playlistTrack">
						<div class="border">
							<div class="inner" />
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
