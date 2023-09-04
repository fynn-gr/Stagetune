<script lang="ts">
	import { createPlaylistTrack } from "@/utils";
	import {
		editMode,
		selectedItem,
		isEditing,
		currentDragging,
		playlist,
	} from "../stores";

	export let item: any;
	export let id: number;
	let dragging = false;
	let editing = false;
	let inputElement: HTMLInputElement;

	function handleDragStart(e) {
		let rec = e.target.getBoundingClientRect();
		let x = e.clientX - rec.left;
		if (x < 80) {
			e.dataTransfer.dropEffect = "copy";
			e.dataTransfer.setData("text/plain", "placehold");
			$currentDragging = item;
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

	export function update() {}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="playlistAnotation"
	class:selected={$selectedItem == id}
	class:editMode={$editMode}
	draggable={$editMode}
	on:dragstart={handleDragStart}
	on:dragend={handleDragEnd}
	on:drop={handleDrop}
	on:click={(e) => {
		selectedItem.set(id);
	}}
>
	<div class="border">
		<div class="container">
			<div class="drag-area"></div>
			<input
				type="text"
				bind:value={item.text}
				bind:this={inputElement}
				on:blur={() => {
					editing = false;
				}}
			/>
		</div>
	</div>
</div>
