<script lang="ts">
	import { onMount } from "svelte";
	import { convertFileSrc } from "@tauri-apps/api/tauri";
	import { secondsToMinutes } from "@/utils";
	import { editMode, selectedItem, isEditing, currentDragging, playlist } from "../stores";
	import Annotation from "./Annotation.svelte";
	import Waveform from "./Waveform.svelte";
	import type { playListItem } from "@/utils";

	export let track: playListItem;
	export let id: number;
	export let ctx: AudioContext;
	let dragging = false;
	let missing = false;
	let loaded = false;
	let audioBuffer: AudioBuffer;
	let input: AudioBufferSourceNode;

	let startedAt = 0; //global time started
	let pausedAt = 0; //track relative pause time

	let gainNode: GainNode;
	let fadeNode: GainNode;
	let panNode: StereoPannerNode;
	let gain = 80;
	let pan = 0;

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

	function handleDragStart(e) {
		e.dataTransfer.dropEffect = "copy";
		e.dataTransfer.setData("text/plain", "placehold");
		$currentDragging = track;
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
			input.start(0, pausedAt + cutIn);
			startedAt = ctx.currentTime - pausedAt;
		} else {
			input.start(0, startTime + cutIn);
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
		//load file
		const response = await fetch(convertFileSrc(track.path));
		const arrayBuffer = await response.arrayBuffer();
		audioBuffer = await ctx.decodeAudioData(arrayBuffer);
		input = new AudioBufferSourceNode(ctx, {buffer: audioBuffer})
		track.length = audioBuffer.duration;
		
		loaded = true;
		console.log(track)
		
		gainNode = ctx.createGain();
		fadeNode = ctx.createGain();
		panNode = ctx.createStereoPanner();
		input.connect(fadeNode).connect(gainNode).connect(panNode).connect(ctx.destination);
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

	$:cutIn = track.edit[0];
	$:panNode ? panNode.pan.value = pan : null;
	$:gainNode ? gainNode.gain.setValueAtTime(gain / 100, ctx.currentTime) : null;
	
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="playlistTrack"
	class:selected={$selectedItem == id}
	class:editMode={$editMode}
	class:missing
	class:loaded
	draggable={$editMode}
	on:dragstart={handleDragStart}
	on:dragend={handleDragEnd}
	on:drop={handleDrop}
	on:click={(e) => {
		selectedItem.set(id);
	}}
>

	<div class="border">
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
						white 0%,
						white calc(100% * ${track.state / track.length}),
						#0004 calc(100% * ${track.state / track.length}),
						#0004 100%
					);`}
			/>
			<Waveform
				buffer={audioBuffer}
				samples={100}
				resY={50}
				cutInFac={cutIn / track.length}
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
	
			<!--name-->
			{#if loaded == false}
				<div class="title"><p>loading...</p></div>
			{:else}
				<div class="title"><p>{track.name}</p></div>
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
					<p>–</p>
					<input
						bind:value={gain}
						type="range"
						min="0"
						max="100"
						step="10"
						disabled={!$editMode}
					/>
					<p>+</p>
				</span>
	
				<span>
					<p>L</p>
					<input
						class="pan"
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
</div>
