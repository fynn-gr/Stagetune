<script lang="ts">
	import { onMount } from "svelte";
	import { readBinaryFile } from "@tauri-apps/api/fs";
	import { convertFileSrc } from "@tauri-apps/api/tauri";
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
	$: paused = !track.playing;
	let missing = false;
	let loaded = true;
	let videoElement: HTMLVideoElement;

	function getTitle() {
		if (track.title == undefined) {
			let split = track.path.split("/");
			let fileName = split[split.length - 1];
			let title = fileName.substring(0, fileName.lastIndexOf("."));
			return title;
		} else {
			return track.title;
		}
	}

	function onEnd() {
		if (track.repeat) {
			videoElement.currentTime = 0;
			videoElement.play();
		} else {
			track.playing = false;
			track.state = 0;
		}
	}

	function getState(state: number) {
		return track.state != undefined ? track.state / track.length : 0;
	}

	function handleSkip(e) {
		let rec = e.target.getBoundingClientRect();
		let x = e.clientX - rec.left;
		let perc = Math.min(Math.max(x / rec.left / 2, 0), 1);
		track.state = track.length * perc;
		console.log(perc);
	}

	onMount(async () => {});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="playlistVideo"
	class:selected={$selectedItem == id}
	class:missing
	class:editMode={$editMode}
	class:loaded
	on:click={(e) => {
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
			class="playBtn"
			class:active={track.playing}
			on:click={() => {
				if (track.playing) {
					track.playing = false;
					//audioElement.pause();
				} else {
					track.playing = true;
					//audioElement.play();
				}
			}}
		>
			{#if track.playing}
				<img src="../src/pureUI/icons/square/pause.svg" alt="" />
			{:else}
				<img src="../src/pureUI/icons/square/play.svg" alt="" />
			{/if}
		</button>

		<!--Info-->
		{#if loaded == false}
			<p class="title">loading...</p>
		{:else}
			<p class="title">{getTitle()}</p>
		{/if}

		<!--repeat-->
		<button
			class="repeatBtn"
			class:active={track.repeat}
			on:click={() => {
				track.repeat = $editMode ? !track.repeat : track.repeat;
			}}
		>
			<img src="../src/pureUI/icons/square/repeat.svg" alt="repeat" />
		</button>

		<!--time-->
		<p class="timecode">{secondsToMinutes(track.state)}</p>
		<p class="length">
			{track.length != undefined ? secondsToMinutes(track.length) : "--:--"}
		</p>

		<!--volume-->
		<div class="volume">
			<span>
				<p>-</p>
				<input
					type="range"
					value="100"
					min="0"
					max="100"
					disabled={!$editMode}
				/>
				<p>+</p>
			</span>

			<span>
				<p>L</p>
				<input type="range" value="5" min="0" max="10" disabled={!$editMode} />
				<p>R</p>
			</span>
		</div>
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
