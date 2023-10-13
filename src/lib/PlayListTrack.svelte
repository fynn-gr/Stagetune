<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { convertFileSrc } from "@tauri-apps/api/tauri";
	import { createPlaylistTrack, secondsToMinutes, waveformCalc } from "@/utils";
	import {
		editMode,
		selectedItem,
		isEditing,
		currentDragging,
		playlist,
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
	let missing = false;
	let inFade = false; //currently in fade, cant start or stop track during fade

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
			dragging = true;
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
			console.log("drop Track form playlist", e )
			let oldPosition = $playlist.indexOf($currentDragging);
			let newPosition = id;
			playlist.update((e) => {
				e.splice(oldPosition, 1);
				e.splice(newPosition, 0, $currentDragging);
				return e;
			});
		} else if ($currentDragging.origin == "src") {
			let newPosition = id;
			playlist.update((e) => {
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
		//console.log("handle skip")
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

		if (track.fade.in > 0 && !inFade && useFade) {
			inFade = true;
			fadeNode.gain.setValueAtTime(0.01, 0);
			fadeNode.gain.linearRampToValueAtTime(1, ctx.currentTime + track.fade.in);
			setTimeout(() => {
				inFade = false;
			}, track.fade.in);
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
		if (track.fade.out > 0 && track.playing && !inFade && useFade) {
			inFade = true;
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
				inFade = false;
				track.playing = false;
			}, track.fade.out * 1000);
		} else if (track.playing && !inFade) {
			input.stop();
			end();
			track.playing = false;
		} else if (!inFade) {
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
		const response = await fetch(convertFileSrc(track.path));
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
	$: waveformData = loaded ? waveformCalc(track.buffer, 100, cutIn / track.length) : undefined
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="playlistTrack"
	class:selected={$selectedItem == id}
	class:editMode={$editMode}
	class:missing
	class:loaded={track.buffer != undefined}
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
		<Annotation bind:annotation={track.annotation} {id} start={true} />

		<div class="inner">
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
			<Waveform
				data={waveformData}
				samples={100}
				resY={50}
			/>

			<div class="drag-area">
				<img src="/icons/square/drag_n_drop.svg" alt="">
			</div>

			<!--reset-btn-->
			<button
				class="play-btn"
				on:click={() => {
					stop(true)
				}}
			>
				<img src="./icons/square/reset.svg" alt="">
			</button>

			<!--play Button-->
			<button
				class="play-btn"
				class:active={track.playing}
				on:click={() => {
					playPause();
				}}
			>
				{#if inFade}
					<img src="./icons/square/fade.svg" alt="" />
				{:else if track.playing}
					<img src="./icons/square/pause.svg" alt="" />
				{:else}
					<img src="./icons/square/play.svg" alt="" />
				{/if}
			</button>

			<!--name-->
			{#if track.buffer != undefined}
				<div class="title">
					<input
						type="text"
						bind:value={track.name}
						on:focus={() => {
							isEditing.update((e) => e + 1);
						}}
						on:blur={() => {
							isEditing.update((e) => e - 1);
						}}
						disabled={!$editMode || $selectedItem != id}
					>
				</div>
			{:else}
				<div class="title"><p>loading...</p></div>
			{/if}

			<!--Hotkey-->
			{#if track.hotkey != undefined}
				<div class="option hotkey">
					<p>{track.hotkey}</p>
				</div>
			{/if}

			<!--fade icons-->
			{#if !$editMode && track.fade.in > 0}
				<img class="option fade-icon" src="./icons/square/fade_in.svg" alt="">
			{/if}

			{#if !$editMode && track.fade.out > 0}
				<img class="option fade-icon" src="./icons/square/fade_out.svg" alt="">
			{/if}

			<!--repeat-->
			<button
				class="option repeat-btn"
				class:active={track.repeat}
				on:click={() => {
					track.repeat = $editMode ? !track.repeat : track.repeat;
				}}
			>
				<img src="./icons/square/repeat.svg" alt="repeat" />
			</button>

			<!--auto reset-->
			<button
				class="option auto-reset-btn"
				class:active={track.autoReset}
				on:click={() => {
					track.autoReset = $editMode ? !track.autoReset : track.autoReset;
				}}
			>
				<img src="./icons/square/auto_reset.svg" alt="auto reset">
			</button>

			<!--time-->
			<p class="timecode">{secondsToMinutes(track.state)}</p>
			<p class="length">
				{cutTrackLength != null ? secondsToMinutes(cutTrackLength) : "--:--"}
			</p>


			<!--fade-->
			<span class="fade">
				<p>Fade in:</p>
				<input
					type="number"
					bind:value={track.fade.in}
					on:focus={() => {
						isEditing.update((e) => e + 1);
					}}
					on:blur={() => {
						isEditing.update((e) => e - 1);
					}}
					min="0"
					max={track.length}
					disabled={!$editMode}
				/>
				<p>Fade out:</p>
				<input
					type="number"
					bind:value={track.fade.out}
					on:focus={() => {
						isEditing.update((e) => e + 1);
					}}
					on:blur={() => {
						isEditing.update((e) => e - 1);
					}}
					min="0"
					max={track.length}
					disabled={!$editMode}
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

		<!--annotation after-->
		<Annotation bind:annotation={track.annotation} {id} start={false} />
	</div>
</div>
