<script lang="ts">
import { emit, listen } from "@tauri-apps/api/event";
import { convertFileSrc } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { PhysicalPosition, PhysicalSize } from "@tauri-apps/api/window";
import { onMount } from "svelte";
import type { videoListElement } from "./ts/Types";

let editMode = true;
let list: Array<videoListElement> = [];
let listElements: Array<HTMLVideoElement> = [];
let active = -1;
let buffer: any[] = [];

//play call to a video
const unlistenPlay = listen("play_video", (event: any) => {
	console.log(event);
	list.forEach((e, i) => {
		if (e.name == event.payload.name) active = i;
	});
	listElements[active].play();
});

//skip, pause, stop or resume the active video
const unlistenUpdate = listen("update_play", (e: any) => {
	console.log(e.payload);
	if (e.payload.action == "stop") {
		listElements[active].pause();
		//active = -1;
	} else if (e.payload.action == "skip") {
		listElements[active].currentTime =
			listElements[active].duration * e.payload.position;
	} else if (e.payload.action == "pause") {
		listElements[active].pause();
	} else if (e.payload.action == "resume") {
		listElements[active].play();
	}
});

//update the video list
const unlistenUpdateList = listen("updateList", e => {
	list = e.payload.list;
});

//update the edit Mode value
const unlistenEditMode = listen("editMode", e => {
	editMode = e.payload.edit;
});

//set the window to Monitor
const unlistenProjectorLocation = listen("projector_set_location", async e => {
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
			emit("video_state", {
				state: listElements[active].currentTime,
				duration: listElements[active].duration,
				name: list[active].name,
			});
		}

		/*
			for (let i = 0; i < listElements.length; i++) {
				buffer[i] = {
					buffer: listElements[i].buffered.end(0),
					duration:listElements[i].duration
				}
			}
			console.log(buffer)
	
			emit("video_buffer", buffer);
			*/
	}, 100);

	return () => clearInterval(interval);
});
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="wrapper" class:edit={editMode} data-tauri-drag-region>
	{#each list as video, i}
		<video
			id="video"
			controls={editMode}
			src={convertFileSrc(video.url)}
			preload="auto"
			data-tauri-drag-region
			class:vis={i == active}
			bind:this={listElements[i]}
			on:ended={() => {
				emit("video_ended", { name: list[active].name });
			}}
		/>
	{/each}

	{#if editMode}
		<div class="buffers">
			{#each buffer as b}
				<div
					class="bar"
					style={`
						background: linear-gradient(
							90deg,
							red 0%,
							red calc(100% * ${b.buffer / b.duration}),
							#555 calc(100% * ${b.buffer / b.duration}),
							#555 100%
						);`}
				/>
			{/each}
		</div>
	{/if}
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

	video {
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

.buffers {
	position: fixed;
	inset: auto 0 0 0;
	background-color: white;
	display: flex;
	flex-direction: column;

	.bar {
		height: 6px;
		width: 100%;
	}
}

.wrapper.edit {
	overflow: scroll;

	&::-webkit-scrollbar {
		width: 0px;
	}

	video {
		width: 50%;
		height: auto;
		position: relative;
		opacity: 1 !important;
	}
}
</style>
