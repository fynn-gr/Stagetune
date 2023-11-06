<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { convertFileSrc } from "@tauri-apps/api/tauri";
	import { join } from "@tauri-apps/api/path";
	import { createPlaylistTrack, secondsToMinutes, waveformCalc } from "@/utils";
	import {
		editMode,
		selectedItem,
		isEditing,
		currentDragging,
		playlist,
		playlistPath,
		selectedAttached,
	} from "../stores";
	import Annotation from "./Annotation.svelte";
	import Waveform from "./Waveform.svelte";
	import type { playListItem } from "@/utils";

	export let track: playListItem;
	export let id: number;
	export let ctx: AudioContext;
	export let masterGain: GainNode;
	let loaded = false;
	let dragging = false;
	let dragover = false;
	let missing = false;

	let input: AudioBufferSourceNode;
	let gainNode: GainNode;
	let fadeNode: GainNode;
	let panNode: StereoPannerNode;

	function handleDragStart(e) {
		let rec = e.target.getBoundingClientRect();
		let x = e.clientX - rec.left;
		if (x < 80) {
			e.dataTransfer.dropEffect = "copy";
			e.dataTransfer.setData("text/plain", "placehold");
			$currentDragging = track;
			$currentDragging.origin = "playlist";
			dragging = true;
			console.log("current dragging: ", $currentDragging);
		} else {
			e.preventDefault();
		}

		//console.log("drag start", e);
	}

	function handleDragEnd(e) {
		dragging = false;
		//console.log("end dragging", e);
	}

	function handleDrop(e) {
		e.preventDefault();
		e.stopPropagation();
		if ($currentDragging.origin == "playlist") {
			console.log("drop form playlist", e);
			let oldPosition = $playlist.indexOf($currentDragging);
			let newPosition = id;
			playlist.update(e => {
				e.splice(oldPosition, 1);
				e.splice(newPosition, 0, $currentDragging);
				return e;
			});
		} else if ($currentDragging.origin == "src") {
			console.log("drop form src", e);
			let newPosition = id;
			playlist.update(e => {
				e.splice(
					newPosition,
					0,
					createPlaylistTrack(
						"playlist",
						$currentDragging.type,
						$currentDragging.path,
						$currentDragging.name
					)
				);
				return e;
			});
			$selectedItem = newPosition;
		} else {
		}
		$currentDragging = null;
	}

	function handleDragEnter(e) {
		dragover = true;
	}

	function handleDragLeave(e) {
		dragover = false;
	}

	function onEnd() {
		if (ctx.currentTime - track.startedAt >= track.length * 0.96) {
			//reached end of track
			console.log("ended");
			if (track.repeat) {
				stop(true, false);
				play(0);
			} else {
				stop(true);
			}
		}
	}

	function handleSkip(e) {
		let rec = e.target.getBoundingClientRect();
		let x = e.clientX - rec.left;
		let skipFac = Math.min(Math.max(x / rec.width, 0), 1);

		if (track.playing) {
			stop();
			play(cutTrackLength * skipFac);
			track.state = cutTrackLength * skipFac;
		} else {
			track.pausedAt = cutTrackLength * skipFac;
			track.state = cutTrackLength * skipFac;
		}
	}

	export function playPause() {
		//console.log("started at: ", startedAt,"paused at: ", pausedAt)
		if (track.playing) {
			//pause
			stop(track.autoReset, true);
		} else {
			//play
			play(null, true);
		}
	}

	export function play(startTime: number = null, useFade: boolean = false) {
		//resume track

		if (track.fade.in > 0 && track.inFade == null && useFade) {
			track.inFade = "in";
			fadeNode.gain.setValueAtTime(0.01, 0);
			fadeNode.gain.linearRampToValueAtTime(1, ctx.currentTime + track.fade.in);
			setTimeout(() => {
				track.inFade = null;
			}, track.fade.in * 1000);
		}

		if (startTime == null) {
			input.start(0, track.pausedAt + cutIn);
			track.startedAt = ctx.currentTime - track.pausedAt;
		} else {
			input.start(0, startTime + cutIn);
			track.startedAt = ctx.currentTime - startTime;
		}

		track.playing = true;
	}

	export function stop(reset: boolean = false, useFade: boolean = false) {
		const end = () => {
			input = new AudioBufferSourceNode(ctx, { buffer: track.buffer });
			input.connect(fadeNode);
			input.onended = () => {
				onEnd();
			};
			if (reset) {
				console.log("reset song");
				track.pausedAt = 0;
				track.state = 0;
			} else {
				track.pausedAt = ctx.currentTime - track.startedAt;
			}
		};
		//pause track
		if (
			track.fade.out > 0 &&
			track.playing &&
			track.inFade == null &&
			useFade
		) {
			track.inFade = "out";
			fadeNode.gain.setValueAtTime(1, ctx.currentTime);
			fadeNode.gain.linearRampToValueAtTime(
				0.01,
				ctx.currentTime + track.fade.out
			);
			setTimeout(() => {
				console.log("stop");
				input.stop();
				fadeNode = ctx.createGain();
				fadeNode.connect(gainNode);
				input.connect(fadeNode);
				end();
				track.inFade = null;
				track.playing = false;
			}, track.fade.out * 1000);
		} else if (track.playing && track.inFade == null) {
			input.stop();
			end();
			track.playing = false;
		} else if (track.inFade == null) {
			end();
		}
	}

	export function getBuffer(): AudioBuffer {
		return track.buffer;
	}

	export function update() {
		if (track.playing) {
			track.state = ctx.currentTime - track.startedAt;
		}
	}

	onMount(async () => {
		//load file
		const absPath = await join($playlistPath, track.path);
		const response = await fetch(convertFileSrc(absPath));
		const arrayBuffer = await response.arrayBuffer();
		track.buffer = await ctx.decodeAudioData(arrayBuffer);
		input = new AudioBufferSourceNode(ctx, { buffer: track.buffer });
		loaded = true;
		track.length = track.buffer.duration;

		//track = track
		console.log(track);

		gainNode = ctx.createGain();
		fadeNode = ctx.createGain();
		panNode = ctx.createStereoPanner();
		input
			.connect(fadeNode)
			.connect(gainNode)
			.connect(panNode)
			.connect(masterGain);
		input.onended = () => {
			onEnd();
		};
	});

	$: cutIn = track.edit.in;
	$: cutTrackLength = track.length ? track.length - cutIn : null;
	$: panNode ? (panNode.pan.value = track.pan) : null;
	$: gainNode
		? gainNode.gain.setValueAtTime(track.volume / 100, ctx.currentTime)
		: null;
	$: waveformData = loaded
		? waveformCalc(track.buffer, 300, cutIn / track.length)
		: undefined;
	$: $currentDragging == null ? (dragover = false) : null;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="playlist-item track"
	class:selected={$selectedItem == id}
	class:missing
	class:drag-over={dragover}
	class:loaded={track.buffer != undefined}
	draggable={$editMode}
	on:dragstart={handleDragStart}
	on:dragend={handleDragEnd}
	on:dragenter={handleDragEnter}
	on:dragleave={handleDragLeave}
	on:drop={handleDrop}
	on:click={e => {
		selectedItem.set(id);
		selectedAttached.set(false);
		console.log(e);
	}}
>
	<div class="drag-area">
		<p>{id + 1}</p>
	</div>

	<!--annotation attached-->
	<Annotation
		bind:annotation={track.annotation}
		{id}
		selected={$selectedItem == id && $selectedAttached}
	/>

	<div
		class="inner"
		style={$currentDragging == null ? "" : "pointer-events: none;"}
	>
		<!--progress-->
		<div
			class="progress"
			on:click={handleSkip}
			style={`
					background: linear-gradient(
						90deg,
						var(--secondary) 0%,
						var(--secondary) calc(100% * ${track.state / cutTrackLength}),
						#555 calc(100% * ${track.state / cutTrackLength}),
						#555 100%
					);`}
		/>
		<Waveform data={waveformData} samples={300} resY={50} />

		<!--reset-btn-->
		<button
			class="play-btn"
			on:click={() => {
				stop(true);
			}}
		>
			<img src="./icons/square/reset.svg" alt="" draggable="false" />
		</button>

		<!--play Button-->
		<button
			class="play-btn"
			class:active={track.playing}
			on:click={() => {
				playPause();
			}}
		>
			{#if track.inFade != null}
				<img
					src="./icons/square/fade.svg"
					alt=""
					draggable="false"
					class="fade-state-icon"
				/>
			{:else if track.playing}
				<img src="./icons/square/pause.svg" alt="" draggable="false" />
			{:else}
				<img src="./icons/square/play.svg" alt="" draggable="false" />
			{/if}
		</button>

		<!--name-->
		{#if track.buffer != undefined}
			<div class="title">
				<input
					type="text"
					bind:value={track.name}
					on:focus={() => {
						isEditing.update(e => e + 1);
					}}
					on:blur={() => {
						isEditing.update(e => e - 1);
					}}
					disabled={!$editMode || $selectedItem != id}
				/>
			</div>
		{:else}
			<div class="title"><p>loading...</p></div>
		{/if}

		<div class="options">
			<!--Hotkey-->
			{#if track.hotkey != undefined}
				<div class="option hotkey">
					<p>{track.hotkey}</p>
				</div>
			{/if}

			<!--fade icons-->
			{#if !$editMode && track.fade.in > 0}
				<img
					class="option fade-icon"
					src="./icons/square/fade_in.svg"
					alt=""
					draggable="false"
				/>
			{/if}

			{#if !$editMode && track.fade.out > 0}
				<img
					class="option fade-icon"
					src="./icons/square/fade_out.svg"
					alt=""
					draggable="false"
				/>
			{/if}

			<!--repeat-->
			<button
				class="option repeat-btn"
				class:active={track.repeat}
				on:click={() => {
					track.repeat = $editMode ? !track.repeat : track.repeat;
				}}
				title="repeat track"
			>
				<img src="./icons/square/repeat.svg" alt="repeat" draggable="false" />
			</button>

			<!--auto reset-->
			<button
				class="option auto-reset-btn"
				class:active={track.autoReset}
				on:click={() => {
					track.autoReset = $editMode ? !track.autoReset : track.autoReset;
				}}
				title="auto reset track on pause"
			>
				<img
					src="./icons/square/auto_reset.svg"
					alt="auto reset"
					draggable="false"
				/>
			</button>
		</div>

		<!--time-->
		<p class="timecode">{secondsToMinutes(track.state)}</p>
		<p class="length">
			{cutTrackLength != null ? secondsToMinutes(cutTrackLength) : "--:--"}
		</p>

		<!--fade-->
		<span class="fade">
			<img src="./icons/square/fade_in.svg" alt="" />
			<input
				type="number"
				bind:value={track.fade.in}
				on:focus={() => {
					isEditing.update(e => e + 1);
				}}
				on:blur={() => {
					isEditing.update(e => e - 1);
				}}
				min="0"
				max={track.length}
				disabled={!$editMode}
				title="Fade In"
			/>
			<img src="./icons/square/fade_out.svg" alt="" />
			<input
				type="number"
				bind:value={track.fade.out}
				on:focus={() => {
					isEditing.update(e => e + 1);
				}}
				on:blur={() => {
					isEditing.update(e => e - 1);
				}}
				min="0"
				max={track.length}
				disabled={!$editMode}
				title="Fade Out"
			/>
		</span>

		<!--volume Pan-->
		<div class="volume">
			<span>
				<p>–</p>
				<input
					bind:value={track.volume}
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
					bind:value={track.pan}
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
</div>
