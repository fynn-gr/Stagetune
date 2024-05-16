<script lang="ts">
	import { onMount } from "svelte";
	import { convertFileSrc } from "@tauri-apps/api/tauri";
	import { join } from "@tauri-apps/api/path";
	import { exists } from "@tauri-apps/api/fs";
	import { message } from "@tauri-apps/api/dialog";

	import {
		createPlaylistTrack,
		secondsToMinutes,
		waveformCalc,
	} from "@/ts/Utils";
	import type { playListItem } from "@/ts/Types";
	import {
		editMode,
		selectedItem,
		isEditing,
		currentDragging,
		playlist,
		playlistPath,
		settings,
		draggingOrigin,
	} from "../ts/Stores";
	import Annotation from "./Annotation.svelte";
	import Waveform from "./Waveform.svelte";

	export let track: playListItem;
	export let id: number;
	export let ctx: AudioContext;
	export let masterGain: GainNode;
	let dragging = false;
	let dragover: "top" | "bottom" = null;
	let titleEl: HTMLElement;

	let input: AudioBufferSourceNode;
	let gainNode: GainNode;
	let fadeNode: GainNode;
	let panNode: StereoPannerNode;

	function handleDragStart(e) {
		//calc pointer position
		let rec = e.target.getBoundingClientRect();
		let x = e.clientX - rec.left;

		//drag if pointer on drag area
		if (x < 80) {
			e.dataTransfer.dropEffect = "copy";
			e.dataTransfer.setData("text/plain", "placehold");
			$currentDragging = track;
			$draggingOrigin = "playlist";
			dragging = true;
			console.log("start dragging: ", $currentDragging);
		} else {
			e.preventDefault();
		}

		//console.log("drag start", e);
	}

	function handleDragEnd(e) {
		dragging = false;
		console.log("end dragging");
	}

	function handleDrop(e) {
		e.preventDefault();
		e.stopPropagation();

		let rec = e.target.getBoundingClientRect();
		let y = e.clientY - rec.top;

		let newPosition;
		if (y > rec.height / 2) {
			newPosition = id + 1;
		} else {
			newPosition = id;
		}

		handleDrop(newPosition);
	}

	function handleDragEnter(e) {
		//calc mouse position
		let rec = e.target.getBoundingClientRect();
		let y = e.clientY - rec.top;

		//console.log(y,rec.height / 2)
		if (y > rec.height / 2) {
			dragover = "top";
		} else {
			dragover = "bottom";
		}
	}

	function handleDragLeave(e) {
		dragover = null;
	}

	function onEnd() {
		if (ctx.currentTime - track.startedAt >= (track.length - cutIn) * 0.96) {
			//reached end of track
			console.log("ended");
			console.log(ctx.currentTime - track.startedAt, track.length * 0.96);
			if (track.repeat) {
				stop(true, false);
				play(0);
			} else {
				stop(true);
			}
		}
	}

	function handleSkip(e) {
		if ($settings.allowSkipLive || $editMode) {
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
	}

	async function load() {
		//load file
		const absPath = await join($playlistPath, track.path);
		console.log("load: ", absPath);

		//test file exist to throw error if file missing
		if (await exists(absPath)) {
			const response = await fetch(convertFileSrc(absPath));
			const arrayBuffer = await response.arrayBuffer();
			track.buffer = await ctx.decodeAudioData(arrayBuffer);
			input = new AudioBufferSourceNode(ctx, { buffer: track.buffer });
			track.loaded = true;
			track.length = track.buffer.duration;
		} else {
			console.error(convertFileSrc(absPath), "track not found");
			track.missing = true;
			message("Media File is missing or moved: " + absPath, {
				title: "File not found",
				type: "warning",
			});
		}

		//create audio chain
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
			try {
				input.start(0, startTime + cutIn);
			} catch (err) {
				console.log(err);
			}
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
				track.pausedAt = 0;
				track.state = 0;
			} else {
				track.pausedAt = ctx.currentTime - track.startedAt;
			}
		};
		//pause track
		if (track.playing && track.inFade != null && !useFade) {
			//stop while in fade
			track.inFade = null;
			track.playing = false;
			fadeNode.gain.setValueAtTime(1, ctx.currentTime);
			input.stop();
			end();
		} else if (
			track.fade.out > 0 &&
			track.playing &&
			track.inFade == null &&
			useFade
		) {
			//fade out
			track.inFade = "out";
			fadeNode.gain.setValueAtTime(1, ctx.currentTime);
			fadeNode.gain.linearRampToValueAtTime(
				0.01,
				ctx.currentTime + track.fade.out
			);
			setTimeout(() => {
				console.log("stop");
				try {
					input.stop();
				} catch (err) {
					console.log(err);
				}
				fadeNode = ctx.createGain();
				fadeNode.connect(gainNode);
				input.connect(fadeNode);
				end();
				track.inFade = null;
				track.playing = false;
			}, track.fade.out * 1000);
		} else if (track.playing && track.inFade == null) {
			//pause without fade out
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

	onMount(() => {
		load();
	});

	$: cutIn = track.edit.in;
	$: cutTrackLength = track.length ? track.length - cutIn : null;
	$: panNode ? (panNode.pan.value = track.pan) : null;
	$: gainNode
		? gainNode.gain.setValueAtTime(track.volume / 100, ctx.currentTime)
		: null;
	$: $currentDragging == null ? (dragover = null) : null;
	$: if (!track.loaded) load();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="playlist-item track"
	class:selected={$selectedItem == id}
	class:missing={track.missing}
	class:drag-top={dragover == "bottom"}
	class:drag-bottom={dragover == "top"}
	class:loaded={track.buffer != undefined}
	draggable={$editMode}
	on:dragstart={handleDragStart}
	on:dragend={handleDragEnd}
	on:dragover={handleDragEnter}
	on:dragleave={handleDragLeave}
	on:drop={handleDrop}
	on:click={e => {
		selectedItem.set(id);
		console.log(e);
	}}
>
	<div class="drag-area">
		<p>{id + 1}</p>
	</div>

	<!--annotation attached-->
	{#if $settings.showAnnotations}
		<Annotation bind:annotation={track.annotation} {id} />
	{/if}

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
		<Waveform
			data={waveformCalc(track.buffer, 300, cutIn / track.length)}
			samples={300}
			resY={50}
		/>

		<!--reset-btn-->
		<button
			class="play-btn"
			title="Reset"
			on:click={() => {
				stop(true);
			}}
		>
			<img src="./icons/square/reset.svg" alt="" draggable="false" />
		</button>

		<!--play Button-->
		<button
			class="play-btn"
			title="Play"
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
		{#if track.buffer}
			<div class="title">
				<div
					class="input"
					contenteditable={$selectedItem == id && $editMode}
					bind:this={titleEl}
					on:focus={() => {
						isEditing.update(e => e + 1);
					}}
					on:blur={() => {
						isEditing.update(e => e - 1);
						track.name = titleEl.innerText;
					}}
				>
					{track.name}
				</div>
			</div>
		{:else if track.missing}
			<div class="title">
				<p class="input">{"File not found: " + track.path}</p>
			</div>
		{:else}
			<div class="title"><p class="input">Loading...</p></div>
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
		{#if $settings.showFadeOptions}
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
		{/if}

		<!--volume Pan-->
		{#if $settings.showVolumeOptions}
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
		{/if}
	</div>
</div>
