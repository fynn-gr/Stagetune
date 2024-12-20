<script lang="ts">
import { DropHandler } from "@/ts/Utils";
import {
	editMode,
	selectedItem,
	isEditing,
	currentDragging,
	playlist,
	contextMenu,
	draggingOrigin,
} from "../ts/Stores";
import { onMount } from "svelte";

export let track: any;
export let id: number;
let dragging = false;
let dragover: "top" | "bottom" | null = null;
let annotationEl: HTMLElement;

function handleDragStart(e: DragEvent) {
	//calc pointer position
	const target = e.target as HTMLElement;
	let rec = target.getBoundingClientRect();
	let x = e.clientX - rec.left;

	//drag if pointer on drag area
	if (x < 80) {
		const dataTransfer = e.dataTransfer as DataTransfer;
		dataTransfer.dropEffect = "copy";
		dataTransfer.setData("text/plain", "placehold");
		$currentDragging = track;
		$draggingOrigin = "playlist";
		dragging = true;
	} else {
		e.preventDefault();
	}
}

function handleDragEnd(e: any) {
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

function handleDragLeave(e: any) {
	dragover = null;
}

export function update() {}

export function playPause() {}

export function play() {}

export function stop() {}

onMount(() => {
	if (track.annotation != null) annotationEl.innerHTML = track.annotation.text;
});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="playlist-item annotation"
	class:selected={$selectedItem == id}
	class:drag-over={dragover}
	draggable={$editMode}
	on:contextmenu={e => {
		if ($editMode) {
			$contextMenu = {
				position: { x: e.clientX, y: e.clientY },
				content: [
					{
						name: "Gray",
						icon: "./icons/menu_win/gray.svg",
						iconColor: true,
						action: () => {
							$playlist[id].annotation.color = null;
						},
					},
					{
						name: "Red",
						icon: "./icons/menu_win/red.svg",
						iconColor: true,
						action: () => {
							$playlist[id].annotation.color = "hsl(5, 54%, 33%)";
						},
					},
					{
						name: "Orange",
						icon: "./icons/menu_win/orange.svg",
						iconColor: true,
						action: () => {
							$playlist[id].annotation.color = "hsl(25.4deg 66% 37%)";
						},
					},
					{
						name: "Green",
						icon: "./icons/menu_win/green.svg",
						iconColor: true,
						action: () => {
							$playlist[id].annotation.color = "hsl(102deg 62% 30%)";
						},
					},
					{
						name: "Teal",
						icon: "./icons/menu_win/teal.svg",
						iconColor: true,
						action: () => {
							$playlist[id].annotation.color = "hsl(169.44deg 62% 30%)";
						},
					},
					{
						name: "Blue",
						icon: "./icons/menu_win/blue.svg",
						iconColor: true,
						action: () => {
							$playlist[id].annotation.color = "hsl(205.44deg 62% 30%)";
						},
					},
					{
						name: "Purple",
						icon: "./icons/menu_win/purple.svg",
						iconColor: true,
						action: () => {
							$playlist[id].annotation.color = "hsl(274.67deg 53.55% 26.67%)";
						},
					},
				],
			};
			console.log($contextMenu, e);
		}
	}}
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
		<p>{id + 1}</p>
	</div>

	<div
		class="container"
		style={`background: ${track.annotation.color};
				pointer-events: ${$currentDragging == null ? "" : "none"};
		`}
	>
		<div
			class="input"
			contenteditable={$selectedItem == id && $editMode}
			bind:this={annotationEl}
			on:focus={e => {
				isEditing.update(e => e + 1);
			}}
			on:blur={() => {
				isEditing.update(e => e - 1);
				track.annotation.text = annotationEl.innerHTML;
			}}
		>
			<p>{track.annotation.text}</p>
		</div>
	</div>
</div>
