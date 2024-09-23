<script lang="ts">
// Svelte, Tauri
import { onMount } from "svelte";
import { convertFileSrc } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import { exists } from "@tauri-apps/plugin-fs";
import { message } from "@tauri-apps/plugin-dialog";

// Components
import Annotation from "./Annotation.svelte";
import Waveform from "./Waveform.svelte";

// Stores, Utils
import { DropHandler, secondsToMinutes, waveformCalc } from "@/ts/Utils";
import {
	editMode,
	selectedItem,
	isEditing,
	currentDragging,
	playlistPath,
	settings,
	draggingOrigin,
	hotkeys,
} from "../ts/Stores";
import type { PlaylistItem } from "@/ts/Types";
import VolumeControl from "./VolumeControl.svelte";

export let track: PlaylistItem;
export let id: number;
export let ctx: AudioContext;
export let masterGain: GainNode;

let hotkeySelect: number | undefined;
let dragging = false;
let dragover: "top" | "bottom" | null = null;
let titleEl: HTMLElement;

//Audio
let input: AudioBufferSourceNode;
let gainNode: GainNode;
let fadeNode: GainNode;
let panNode: StereoPannerNode;

function handleDragStart(e: DragEvent) {
	//calc pointer position
	const target = e.target as HTMLElement;
	let rec = target.getBoundingClientRect();
	let x = e.clientX - rec.left;

	//drag if pointer on drag area
	if (x < 80) {
		const dataTransfer = e.dataTransfer as DataTransfer;
		dataTransfer.dropEffect = "copy";
		dataTransfer.setData("text/plain", "placehold");
		$currentDragging = track;
		$draggingOrigin = "playlist";
		dragging = true;
	} else {
		e.preventDefault();
	}
}

function handleDragEnd(e: DragEvent) {
	dragging = false;
}

function handleDrop(e: DragEvent) {
	e.preventDefault();
	e.stopPropagation();

	const target = e.target as HTMLElement;
	let rec = target.getBoundingClientRect();
	let y = e.clientY - rec.top;
	let newPosition = y > rec.height / 2 ? id + 1 : id;

	DropHandler(newPosition);
}

function handleDragEnter(e: DragEvent) {
	const target = e.target as HTMLElement;
	let rec = target.getBoundingClientRect();
	let y = e.clientY - rec.top;
	dragover = y > rec.height / 2 ? "top" : "bottom";
}

function handleDragLeave() {
	dragover = null;
}

function handleHotkeySelect(e: any) {
	console.log(hotkeySelect);
	if (hotkeySelect != undefined) {
		//selected Number
		if ($hotkeys[hotkeySelect - 1].track != null) {
			//remove old track at hotkey
			$hotkeys[hotkeySelect - 1].track.hotkey = null;
			$hotkeys[hotkeySelect - 1].track = null;
		}
		if (track.hotkey != undefined) {
			//remove old hotkey from current track first
			$hotkeys[track.hotkey].track = null;
		}
		//set new hotkey
		track.hotkey = hotkeySelect;
		$hotkeys[hotkeySelect - 1].track = track;
	} else {
		//selected undefined
		$hotkeys[track.hotkey].track = null;
		track.hotkey = null;
	}
}

function onEnd() {
	if (ctx.currentTime - track.startedAt! >= (track.length! - cutIn) * 0.96) {
		if (track.repeat) {
			stop(true, false);
			play(0);
		} else {
			stop(true);
		}
	}
}

function handleSkip(e: MouseEvent) {
	if ($settings.allowSkipLive || $editMode) {
		const target = e.target as HTMLElement;
		let rec = target.getBoundingClientRect();
		let x = e.clientX - rec.left;
		let skipFac = Math.min(Math.max(x / rec.width, 0), 1);

		if (track.playing) {
			stop();
			play(cutTrackLength! * skipFac);
			track.state = cutTrackLength! * skipFac;
		} else {
			track.pausedAt = cutTrackLength! * skipFac;
			track.state = cutTrackLength! * skipFac;
		}
	}
}

async function load() {
	//load file
	const absPath = await join($playlistPath, track.path!);

	//test file exist to throw error if file missing
	if (await exists(absPath)) {
		console.log(convertFileSrc(absPath));
		const response = await fetch(convertFileSrc(absPath));
		const arrayBuffer = await response.arrayBuffer();
		track.buffer = await ctx.decodeAudioData(arrayBuffer);
		input = new AudioBufferSourceNode(ctx, { buffer: track.buffer });
		track.loaded = true;
		track.length = track.buffer.duration;
	} else {
		console.error(convertFileSrc(absPath), "track not found");
		track.missing = true;
		message(`Media File is missing or moved: ${absPath}`, {
			title: "File not found",
			kind: "warning",
		});
	}

	setupAudioChain();
}

function setupAudioChain() {
	gainNode = ctx.createGain();
	fadeNode = ctx.createGain();
	panNode = ctx.createStereoPanner();
	input
		.connect(fadeNode)
		.connect(gainNode)
		.connect(panNode)
		.connect(masterGain);
	input.onended = onEnd;
}

export function playPause() {
	track.playing ? stop(track.autoReset, true) : play(undefined, true);
}

export function play(
	startTime: number | undefined = undefined,
	useFade: boolean = false,
) {
	//resume track

	if (track.fade.in > 0 && track.inFade == null && useFade) {
		track.inFade = "in";
		fadeNode.gain.setValueAtTime(0.01, 0);
		fadeNode.gain.linearRampToValueAtTime(1, ctx.currentTime + track.fade.in);
		setTimeout(() => {
			track.inFade = null;
		}, track.fade.in * 1000);
	}
	input.start(0, (startTime ?? track.pausedAt) + cutIn);
	track.startedAt = ctx.currentTime - (startTime ?? track.pausedAt);
	track.playing = true;
}

export function stop(reset: boolean = false, useFade: boolean = false) {
	const end = () => {
		input = new AudioBufferSourceNode(ctx, { buffer: track.buffer });
		setupAudioChain();
		track.pausedAt = reset ? 0 : ctx.currentTime - track.startedAt;
		track.state = reset ? 0 : track.state;
	};
	if (track.playing) {
		if (track.inFade && !useFade) {
			track.inFade = null;
			fadeNode.gain.setValueAtTime(1, ctx.currentTime);
			input.stop();
			end();
		} else if (track.fade.out > 0 && !track.inFade && useFade) {
			track.inFade = "out";
			fadeNode.gain.linearRampToValueAtTime(
				0.01,
				ctx.currentTime + track.fade.out,
			);
			setTimeout(() => {
				input.stop();
				end();
				track.inFade = null;
				track.playing = false;
			}, track.fade.out * 1000);
		} else {
			input.stop();
			end();
			track.playing = false;
		}
	} else {
		end();
	}
}

export function getBuffer(): AudioBuffer {
	return track.buffer as AudioBuffer;
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
$: cutTrackLength = track.length ? track.length - cutIn : 0;
$: panNode ? (panNode.pan.value = track.pan) : null;
$: gainNode
	? gainNode.gain.setValueAtTime(track.volume / 100, ctx.currentTime)
	: null;
$: $currentDragging == null ? (dragover = null) : null;
$: if (!track.loaded) load();
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
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
	on:click={() => selectedItem.set(id)}
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
					var(--accent) 0%,
					var(--accent) calc(100% * ${track.state / cutTrackLength}),
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
			on:click={playPause}
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
					on:focus={() => isEditing.update(e => e + 1)}
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

		<!--Hotkey Display-->
		{#if track.hotkey != undefined}
			<div class="hotkey-display">
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

		<!--time-->
		<p class="timecode">{secondsToMinutes(track.state)}</p>
		<p class="length">
			{cutTrackLength != null ? secondsToMinutes(cutTrackLength) : "--:--"}
		</p>

		<div class="options">
			<!--Hotkey-->
			<div class="option hotkey" class:assigned={track.hotkey != undefined}>
				<select bind:value={hotkeySelect} on:change={handleHotkeySelect}>
					<option value={undefined}>none</option>
					<option value={1}>1</option>
					<option value={2}>2</option>
					<option value={3}>3</option>
					<option value={4}>4</option>
					<option value={5}>5</option>
					<option value={6}>6</option>
					<option value={7}>7</option>
					<option value={8}>8</option>
					<option value={9}>9</option>
				</select>
				<p class:unset={track.hotkey == undefined}>{track.hotkey || "?"}</p>
			</div>

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

		<!--fade-->
		{#if $settings.showFadeOptions}
			<span class="fade">
				<img src="./icons/square/fade_in.svg" alt="" />
				<input
					type="number"
					bind:value={track.fade.in}
					on:focus={() => isEditing.update(e => e + 1)}
					on:blur={() => isEditing.update(e => e - 1)}
					min="0"
					max={track.length}
					disabled={!$editMode}
					title="Fade In"
				/>
				<img src="./icons/square/fade_out.svg" alt="" />
				<input
					type="number"
					bind:value={track.fade.out}
					on:focus={() => isEditing.update(e => e + 1)}
					on:blur={() => isEditing.update(e => e - 1)}
					min="0"
					max={track.length}
					disabled={!$editMode}
					title="Fade Out"
				/>
			</span>
		{/if}

		<!--volume Pan-->
		{#if $settings.showVolumeOptions}
			<VolumeControl bind:track slider={true} />
		{/if}
	</div>
</div>
