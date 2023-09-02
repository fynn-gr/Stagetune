<script lang="ts">
	import { createPlaylistTrack } from "@/utils";
	import {
		editMode,
		selectedItem,
		isEditing,
		currentDragging,
		playlist,
	} from "../stores";
	import { tick } from "svelte";

	export let item: any;
	export let id: number;
	let dragging = false;
	let editing = false;
	let inputElement: HTMLInputElement;

	function handleDragStart(e) {
		e.dataTransfer.dropEffect = "copy";
		e.dataTransfer.setData("text/plain", "placehold");
		$currentDragging = item;
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
	draggable={$editMode}
	on:dragstart={handleDragStart}
	on:dragend={handleDragEnd}
	on:drop={handleDrop}
	on:click={(e) => {
		selectedItem.set(id);
	}}
>
	<div class="border">
		<div
			class="container"
			on:dblclick={e => {
				editing = !editing;
				if (editing) {
					//tick();
					console.log(inputElement)
					inputElement.focus()
					console.log(inputElement.select())
					isEditing.update((e) => e + 1);
				} else {
					inputElement.blur();
					isEditing.update((e) => e - 1);
				}
			}}
		>
			<input
				style="visibility: {editing ? "visible" : "hidden"};"
				type="text"
				disabled={!$editMode || $selectedItem != id}
				bind:value={item.text}
				bind:this={inputElement}
				on:blur={() => {
					editing = false;
				}}
			/>
			<p
				class="value-display"
				style="visibility: {editing ? "hidden" : "visible"};"
			>{item.text}</p>
		</div>
	</div>
</div>
