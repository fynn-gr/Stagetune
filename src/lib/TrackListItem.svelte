<script lang="ts">
	import { currentDragging } from "../stores";

	export let entry: any;

	let self: HTMLElement;
	let dragging = false;

	function getName() {
		let name = entry.name.substring(0, entry.name.lastIndexOf("."));
		return name;
	}

	function handleDragStart(e) {
		e.dataTransfer.dropEffect = "copy";
		e.dataTransfer.setData("text/plain", "placehold");
		$currentDragging = { name: entry.name, path: entry.path, type: entry.type };
		dragging = true;
		console.log("drag start", e);
	}

	function handleDragEnd(e) {
		dragging = false;
		console.log("end dragging", e);
	}
</script>

<div
	bind:this={self}
	class="trackListItem"
	class:dragging
	draggable="true"
	on:dragstart={handleDragStart}
	on:dragend={handleDragEnd}
>
	{#if entry.type == "track"}
		<img src="./icons/square/music.svg" alt="" />
	{:else if entry.type == "video"}
		<img src="./icons/square/film.svg" alt="" />
	{/if}
	<p>{getName()}</p>
</div>
