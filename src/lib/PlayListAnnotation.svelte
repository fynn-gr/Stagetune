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
} from "../ts/Stores.svelte";
import { onMount } from "svelte";

interface Props {
	track: any;
	id: number;
}
let { track = $bindable(), id }: Props = $props();

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

export function getBuffer() {}

export function update() {}

export function playPause() {}

export function play() {}

export function stop() {}

onMount(() => {
	if (track.annotation != null) annotationEl.innerHTML = track.annotation.text;
});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="playlist-item annotation"
	class:selected={$selectedItem == id}
	class:drag-over={dragover}
	draggable={$editMode}
	oncontextmenu={e => {
		if ($editMode) {
			$contextMenu = {
				position: { x: e.clientX, y: e.clientY },
				content: [
					{
						name: "Gray",
						icon: "./icons/app_menu/gray.svg",
						iconColor: true,
						action: () => {
							$playlist[id].annotation.color = null;
						},
					},
					{
						name: "Red",
						icon: "./icons/app_menu/red.svg",
						iconColor: true,
						action: () => {
							$playlist[id].annotation.color = "hsl(5, 54%, 33%)";
						},
					},
					{
						name: "Orange",
						icon: "./icons/app_menu/orange.svg",
						iconColor: true,
						action: () => {
							$playlist[id].annotation.color = "hsl(25.4deg 66% 37%)";
						},
					},
					{
						name: "Green",
						icon: "./icons/app_menu/green.svg",
						iconColor: true,
						action: () => {
							$playlist[id].annotation.color = "hsl(102deg 62% 30%)";
						},
					},
					{
						name: "Teal",
						icon: "./icons/app_menu/teal.svg",
						iconColor: true,
						action: () => {
							$playlist[id].annotation.color = "hsl(169.44deg 62% 30%)";
						},
					},
					{
						name: "Blue",
						icon: "./icons/app_menu/blue.svg",
						iconColor: true,
						action: () => {
							$playlist[id].annotation.color = "hsl(205.44deg 62% 30%)";
						},
					},
					{
						name: "Purple",
						icon: "./icons/app_menu/purple.svg",
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
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	ondrop={handleDrop}
	ondragenter={handleDragEnter}
	ondragleave={handleDragLeave}
	onclick={e => {
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
			onfocus={e => {
				isEditing.update(e => e + 1);
			}}
			onblur={() => {
				isEditing.update(e => e - 1);
				track.annotation.text = annotationEl.innerHTML;
			}}
		>
			<p>{track.annotation.text}</p>
		</div>
	</div>
</div>
