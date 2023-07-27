<script lang="ts">
	import { onMount } from "svelte";
	import { convertFileSrc } from "@tauri-apps/api/tauri";
	import { secondsToMinutes } from "@/utils";
	import { editMode, selectedItem, isEditing } from "../stores";
	import Annotation from "./Annotation.svelte";
	import Waveform from "./Waveform.svelte";

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
		fade?: Array<number>;
		annotation?: Array<string>;
	}

	export let track: playListItem;
	export let id: number;
	export let ctx: AudioContext;
	let missing = false;
	let loaded = false;
	let audioBuffer: AudioBuffer;
	let input: AudioBufferSourceNode;

	let startedAt = 0; //global time started
	let pausedAt = 0; //track relative pause time

	let gainNode: GainNode;
	let panNode: StereoPannerNode;
	let gain = 100;
	let pan = 0;

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
			play(0);
		} else {
			stop();
			pausedAt = 0;
		}
	}

	function handleSkip(e) {
		let rec = e.target.getBoundingClientRect();
		let x = e.clientX - rec.left;
		let perc = Math.min(Math.max(x / rec.width, 0), 1);

		if (track.playing) {
			stop();
			play(track.length * perc);
			track.state = track.length * perc;
		} else {
			pausedAt = track.length * perc;
			track.state = track.length * perc;
		}
			
	}

	export function playPause() {
		//console.log("started at: ", startedAt,"paused at: ", pausedAt)
		if(track.playing) {
			stop();
		} else {
			play();
		}
	}

	export function play(startTime: number = null) {
		//resume track
		if (startTime == null) {
			input.start(0, pausedAt);
			startedAt = ctx.currentTime - pausedAt;
		} else {
			input.start(0, startTime);
			startedAt = ctx.currentTime - startTime;
		}
		console.log("resumed at:", pausedAt)
		track.playing = true;
	}

	export function stop(reset: boolean = false) {
		//pause track
		if (track.playing) input.stop();
		input = new AudioBufferSourceNode(ctx, {buffer: audioBuffer})
		input.connect(gainNode);
		if (reset) {
			pausedAt = 0;
			track.state = 0;
		} else {
			pausedAt = ctx.currentTime - startedAt;
		}
		track.playing = false;
	}

	export function getBuffer(): AudioBuffer {
		return audioBuffer;
	}

	onMount(async () => {
		const response = await fetch(convertFileSrc(track.path));
		const arrayBuffer = await response.arrayBuffer();
		audioBuffer = await ctx.decodeAudioData(arrayBuffer);
		input = new AudioBufferSourceNode(ctx, {buffer: audioBuffer})
		track.length = audioBuffer.duration;
		
		loaded = true;
		
		gainNode = ctx.createGain();
		panNode = ctx.createStereoPanner();
		input.connect(gainNode).connect(panNode).connect(ctx.destination);
		input.onended = () => {onEnd()};

		const loop = async () => {
			await setTimeout(() => {
				if (track.playing) {
					track.state = ctx.currentTime - startedAt;
				}
				loop();
			}, 100)
		}
		loop();
	});

	$:panNode ? panNode.pan.value = pan : null;
	$:gainNode ? gainNode.gain.setValueAtTime(gain / 100, ctx.currentTime) : null;
	
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
	<Annotation bind:annotation={track.annotation} {id} start={true}/>

	<div class="inner">


		<!--progress-->
		
		<div
			class="progress"
			on:click={handleSkip}
			style={`
				background: linear-gradient(
					90deg,
					var(--secondary) 0%,
					var(--secondary) calc(100% * ${track.state / track.length}),
					#0004 calc(100% * ${track.state / track.length}),
					#0004 100%
				);`}
		/>
		<Waveform
			buffer={audioBuffer}
			samples={100}
			res={[1000, 100]}
		/>

		<!--play Button-->
		<button
			class="play-btn"
			class:active={track.playing}
			on:click={() => {
				playPause();
			}}
		>
			{#if track.playing}
				<img src="./icons/square/pause.svg" alt="" />
			{:else}
				<img src="./icons/square/play.svg" alt="" />
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
			class="repeat-btn"
			class:active={track.repeat}
			on:click={() => {
				track.repeat = $editMode ? !track.repeat : track.repeat;
			}}
		>
			<img src="./icons/square/repeat.svg" alt="repeat" />
		</button>

		<!--time-->
		<p class="timecode">{secondsToMinutes(track.state)}</p>
		<p class="length">
			{track.length != undefined ? secondsToMinutes(track.length) : "--:--"}
		</p>

		<!--fade-->
		<span class="fade">
			<p>Fade in:</p>
			<input type="number" value={track.fade[0]} min="0" disabled={!$editMode} />
			<p>Fade out:</p>
			<input type="number" value={track.fade[1]} min="0" disabled={!$editMode} />
		</span>

		<!--volume-->
		<div class="volume">
			<span>
				<p>-</p>
				<input
					bind:value={gain}
					type="range"
					min="0"
					max="100"
					disabled={!$editMode}
				/>
				<p>+</p>
			</span>

			<span>
				<p>L</p>
				<input
					bind:value={pan}
					type="range"
					min={-1}
					max={1}
					step={0.25}
					disabled={!$editMode}
				/>
				<p>R</p>
			</span>
		</div>
	</div>

	<!--annotation after-->
	<Annotation bind:annotation={track.annotation} {id} start={false}/>
</div>
