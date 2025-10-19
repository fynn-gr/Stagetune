<script lang="ts">
import { emit, listen, type EventCallback } from "@tauri-apps/api/event";
import { convertFileSrc } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { PhysicalPosition, PhysicalSize } from "@tauri-apps/api/window";
import { onMount } from "svelte";
import type { videoListElement } from "./ts/Types";
import type { event } from "@tauri-apps/api";

let editMode = $state(true);
let list: Array<videoListElement> = $state([]);
let listElements: Array<HTMLVideoElement | HTMLImageElement> = $state([]);
let active = $state(-1);

//play call to a video
const listenerPlay = listen("play_video", (event: any) => {
	console.log(event);

	list.forEach((e, i) => {
		if (e.name == event.payload.name) active = i; // set active Element
	});
	if (list[active].type == "video") {
		let video = listElements[active] as HTMLVideoElement;
		video.play();
	}
});

//skip, pause, stop or resume the active video
const listenerUpdate = listen("update_play", (e) => {
	console.log(e.payload);

	if (list[active].type == "video") {
		let video = listElements[active] as HTMLVideoElement;
		switch (e.payload.action) {
			case "stop":
				video.pause();
				break;
			case "skip":
				video.currentTime = video.duration * e.payload.position;
				break;
			case "pause":
				video.pause();
				break;
			case "resume":
				video.play();
				break;
		}
	} else if (list[active].type == "image") {
		switch (e.payload.action) {
			case "stop":
				active = -1;
				break;
			case "skip":
				break;
			case "pause":
				break;
			case "resume":
				break;
		}
	} else {
	}
});

//update the video list
const listenerUpdateList = listen("updateList", e => {
	let payload = e.payload as { list: Array<videoListElement> };
	list = payload.list;
});

//update the edit Mode value
const listenerEditMode = listen("editMode", e => {
	editMode = e.payload.edit;
});

//set the window to Monitor
const listenerProjectorLocation = listen("projector_set_location", async e => {
	const pos = e.payload.screen.position;
	const size = e.payload.screen.size;
	console.log(e.payload.screen, pos, size);
	await getCurrentWindow().setPosition(new PhysicalPosition(pos.x, pos.y));
	await getCurrentWindow().setSize(new PhysicalSize(size.width, size.height));
	await getCurrentWindow().setFullscreen(true);
});

onMount(() => {
	emit("projctorReq", {});

	const interval = setInterval(() => {
		if (active != -1) {
			if (list[active].type == "video") {
				//video
				emit("video_state", {
					timeCode: listElements[active].currentTime,
					duration: listElements[active].duration,
					name: list[active].name,
				});
			} else {
				//image
				emit("video_state", {
					state: 1,
					name: list[active].name,
				});
			}
		}
	}, 100);

	return () => clearInterval(interval);
});
</script>

<!-- svelte-ignore a11y_media_has_caption -->
<div class="wrapper" class:editMode>
	{#each list as item, i}
		{#if item.type == "video"}
			<video
				id="video"
				controls={editMode}
				src={convertFileSrc(item.url)}
				preload="auto"
				class:vis={i == active}
				bind:this={listElements[i]}
				onended={() => {
					emit("video_ended", { name: list[active].name });
				}}
			></video>
		{:else}
			<img
				src={convertFileSrc(item.url)}
				class:vis={i == active}
				bind:this={listElements[i]}
				alt=""
			/>
		{/if}
	{/each}
</div>

<style lang="scss">
.wrapper {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	overflow: hidden;
	width: 100vw;
	height: 100vh;
	margin: 0;
	padding: 0;
	background-color: black;

	video,
	img {
		position: absolute;
		width: 100%;
		height: 100%;
		object-fit: contain;
		margin: auto;
		opacity: 0;

		&.vis {
			opacity: 1;
		}
	}
}

.wrapper.editMode {
	overflow: scroll;

	&::-webkit-scrollbar {
		width: 0px;
	}

	video,
	img {
		width: 50%;
		height: auto;
		position: relative;
		opacity: 1 !important;
	}
}
</style>
