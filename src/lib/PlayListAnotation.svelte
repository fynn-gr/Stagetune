<script lang="ts">
	import { editMode, selectedItem, isEditing, currentDragging, playlist } from "../stores";

	export let item: any;
	export let id: number;
	let dragging = false;

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
			playlist.update(e => {
				e.splice(oldPosition, 1)
				e.splice(newPosition, 0, $currentDragging)
				return e
			})
		} else if ($currentDragging.origin == "src") {
			let newPosition = id;
			playlist.update(e => {
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
				})
				return e;
			})
			$selectedItem = newPosition;
		} else {

		}
		$currentDragging = null;
	}
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
		<div class="container">
			<input
				type="text"
				disabled={!$editMode || $selectedItem != id}
				on:focus={() => {
					isEditing.update((e) => e + 1);
				}}
				on:blur={() => {
					isEditing.update((e) => e - 1);
				}}
				bind:value={item.text}
			/>
		</div>
	</div>
</div>
