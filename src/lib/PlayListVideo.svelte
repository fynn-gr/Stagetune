<script lang="ts">
	import { onMount } from "svelte";
	import { emit, listen } from '@tauri-apps/api/event'
	import { secondsToMinutes } from "@/utils";
	import { editMode, selectedItem } from "../stores";

	interface playListItem {
		type: string;

		text?: string;

		playing?: boolean;
		path?: string;
		title?: string;
		length?: number;
		state?: number;
		volume?: number;
		pan?: number;
		repeat?: boolean;
		edit?: Array<number>;
		annotation?: Array<string>;
	}

	export let track: playListItem;
	export let id: number;
	let missing = false;
	track.playing = false;

	function getState(state: number) {
		return track.state != undefined ? track.state : 0;
	}

	onMount(async () => {
		const unlisten = await listen("video_state", (e: any) => {
			track.state = e.payload.progress;
		})
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="playlistVideo"
	class:selected={$selectedItem == id}
	class:missing={missing}
	class:editMode={$editMode}
	on:click={e => {
		selectedItem.set(id);
	}}
>
	<!--annotation before-->
	{#if track.annotation[0] != null}
		<div class="annotationStart">
			<p contenteditable={$editMode && $selectedItem == id}>
				{track.annotation[0]}
			</p>
		</div>
	{/if}

	<div class="inner">

		<!--progress-->
		<div
			class="progress"
			style={`width: calc(100% * ${getState(track.state)});`}
		/>

		<!--play Button-->
		<button
			class="play-btn"
			class:active={track.playing}
			on:click={() => {
				if(track.playing) {
					//pause
					emit("update_play", { action: "pause" })
					track.playing = false;
				} else if (track.state > 0) {
					//resume
					emit("update_play", { action: "resume" })
					track.playing = true;
				} else {
					//start
					emit("play_video", {url: track.path})
					track.playing = true;
				}
			}}
		>
			{#if track.playing}
				<img src="../src/pureUI/icons/square/pause.svg" alt="" />
			{:else}
				<img src="../src/pureUI/icons/square/play.svg" alt="" />
			{/if}
		</button>

		<!--set Button-->
		<button
			class="set-btn"
			class:active={false}
			on:click={async () => {
				emit("update_play", { action: "stop" })
			}}
		>
			<img src="../src/pureUI/icons/square/film.svg" alt="">
		</button>

		<!--Title-->
		<p class="title">{track.title}</p>

	</div>

	<!--annotation after-->
	{#if track.annotation[1] != null}
		<div class="annotationEnd">
			<p contenteditable={$editMode && $selectedItem == id}>
				{track.annotation[1]}
			</p>
		</div>
	{/if}
</div>
