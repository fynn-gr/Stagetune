<script lang="ts">
	import { createPlaylistTrack } from "@/utils";
	import {
		editMode,
		selectedItem,
		isEditing,
		currentDragging,
		playlist,
	} from "../stores";
	import Annotation from "./Annotation.svelte";

	export let track: any;
	export let id: number;
	let dragging = false;
	let dragover = false;
	let editing = false;
	let inputElement: HTMLInputElement;

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
		console.log("end dragging", e);
	}

	function handleDrop(e) {
		e.preventDefault();
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

	export function update() {}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="playlist-item annotation"
	class:selected={$selectedItem == id}
	class:drag-over={dragover}
	draggable={$editMode}
	on:dragstart={handleDragStart}
	on:dragend={handleDragEnd}
	on:drop={handleDrop}
	on:dragenter={handleDragEnter}
	on:dragleave={handleDragLeave}
	on:click={e => {
		selectedItem.set(id);
	}}
>
	<div class="drag-area">
		<p>{id}</p>
	</div>

	<div
		class="container"
		style={$currentDragging == null ? "" : "pointer-events: none;"}
	>
		<input
			type="text"
			disabled={!$editMode || $selectedItem != id}
			on:focus={() => {
				isEditing.update(e => e + 1);
				console.log("in focus", $isEditing);
			}}
			on:blur={() => {
				isEditing.update(e => e - 1);
				console.log("out of focus", $isEditing);
			}}
			bind:value={track.annotation}
		/>
	</div>
</div>
