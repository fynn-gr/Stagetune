<script lang="ts">
	import { onMount } from "svelte";
	import { convertFileSrc } from "@tauri-apps/api/tauri";
	import { secondsToMinutes } from "@/utils";
	import { editMode, selectedItem, isEditing } from "../stores";

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
	let loaded = false;
	let audioElement: HTMLAudioElement;

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

	function onLoaded() {
		loaded = true;
		track.length = audioElement.duration;
	}

	function onEnd() {
		if (track.repeat) {
			audioElement.currentTime = 0;
			audioElement.play();
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
		let perc = Math.min(Math.max(x / rec.width, 0), 1);
		track.state = track.length * perc;
	}

	onMount(async () => {
		/*const file = await readBinaryFile(track.path);
		console.log(file);

		const ctx = new AudioContext();
		const gainNode = ctx.createGain();
		gainNode.gain.value = 1;
		gainNode.connect(ctx.destination)
		const destNode = ctx.destination;
		//const audioBuffer = await ctx.decodeAudioData(file);
		const sampleSource = new AudioBufferSourceNode(ctx, {
			buffer: file
		});
		sampleSource.connect(ctx.destination)
		sampleSource.start();
		*/
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="playlistTrack"
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
			<input
				type="text"
				disabled={!$editMode || $selectedItem != id}
				on:focus={() => {
					isEditing.update((e) => e + 1);
					console.log("in focus", $isEditing);
				}}
				on:blur={() => {
					isEditing.update((e) => e - 1);
					console.log("out of focus", $isEditing);
				}}
				bind:value={track.annotation[0]}
			/>
		</div>
	{/if}

	<div class="inner">
		<!--progress-->
		<img class="waveform" src="./waveform.png" alt="" on:click={handleSkip} />
		<div
			class="progress"
			style={`width: calc(100% * ${getState(track.state)});`}
		/>

		<!--play Button-->
		<button
			class="play-btn"
			class:active={track.playing}
			on:click={() => {
				track.playing = !track.playing;
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

		<audio
			src={convertFileSrc(track.path)}
			bind:this={audioElement}
			bind:currentTime={track.state}
			bind:paused
			on:loadeddata={onLoaded}
			on:ended={onEnd}
			on:waiting={() => {
				console.error("audio waiting");
			}}
			on:stalled={() => {
				console.error("audio stalled");
			}}
		/>

		<!--repeat-->
		<button
			class="repeat-btn"
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

		<!--fade-->
		<span class="fade">
			<p>Fade in:</p>
			<input type="number" value="0" min="0" disabled={!$editMode} />
			<p>Fade out:</p>
			<input type="number" value="0" min="0" disabled={!$editMode} />
		</span>

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
			<input
				type="text"
				disabled={!$editMode || $selectedItem != id}
				on:focus={() => {
					isEditing.update((e) => e + 1);
					console.log("in focus", $isEditing);
				}}
				on:blur={() => {
					isEditing.update((e) => e - 1);
					console.log("out of focus", $isEditing);
				}}
				bind:value={track.annotation[1]}
			/>
		</div>
	{/if}
</div>
