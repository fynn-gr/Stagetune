<script lang="ts">
// Svelte, Tauri
import { onMount, tick } from "svelte";
import { convertFileSrc } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import { exists } from "@tauri-apps/plugin-fs";
import { message } from "@tauri-apps/plugin-dialog";

// Components
import Annotation from "./Annotation.svelte";
import Waveform from "./Waveform.svelte";
import VolumeControl from "./VolumeControl.svelte";
import PropNumber from "@/pureUI/components/props/PropNumber.svelte";

// Stores, Utils
import { DropHandler, secondsToMinutes } from "@/ts/Utils";
import {
	editMode,
	selectedItem,
	isEditing,
	currentDragging,
	settings,
	draggingOrigin,
	hotkeys,
	playlistZoom,
} from "../ts/Stores.svelte";
import type { PlaylistTrack } from "@/ts/Types";

// Props
interface Props {
	track: PlaylistTrack;
	id: number;
	ctx: AudioContext;
	masterGain: GainNode;
}
let { track = $bindable(), id, ctx, masterGain }: Props = $props();

//states
let hotkeySelect: number | undefined = $state(undefined);
let dragging = $state(false);
let dragover: "top" | "bottom" | null = $state(null);
let titleEl: HTMLElement;
let titleIsEditing = $state(false);
let cutTrackLength: number = $state(0);

//Audio
let input: AudioBufferSourceNode = $state(new AudioBufferSourceNode(ctx));
let gainNode: GainNode = $state(new GainNode(ctx));
let fadeNode: GainNode = $state(new GainNode(ctx));
let panNode: StereoPannerNode = $state(new StereoPannerNode(ctx));

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
		if (hotkeys[hotkeySelect - 1].track != null) {
			//remove old track at hotkey
			hotkeys[hotkeySelect - 1].track!.hotkey = null;
			hotkeys[hotkeySelect - 1].track = null;
		}
		if (track.hotkey != undefined) {
			//remove old hotkey from current track first
			hotkeys[track.hotkey].track = null;
		}
		//set new hotkey
		track.hotkey = hotkeySelect;
		hotkeys[hotkeySelect - 1].track = track;
	} else {
		//selected undefined
		hotkeys[track.hotkey!].track = null;
		track.hotkey = null;
	}
}

function onEnd() {
	if (
		ctx.currentTime - track.startedAt! >=
		(track.length! - track.edit.in) * 0.96
	) {
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
			track.timeCode = cutTrackLength! * skipFac;
		} else {
			track.pausedAt = cutTrackLength! * skipFac;
			track.timeCode = cutTrackLength! * skipFac;
		}
	}
}

async function load() {
	//load file
	const absPath = await join(track.pathSource, track.path);
	console.log("loading track: ", absPath);

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
		//file not found
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
	if (!input) return;
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
	if (track.playing) return;

	if (track.fade.in > 0 && track.inFade == null && useFade) {
		track.inFade = "in";
		fadeNode.gain.setValueAtTime(0.01, 0);
		fadeNode.gain.linearRampToValueAtTime(1, ctx.currentTime + track.fade.in);
		setTimeout(() => {
			track.inFade = null;
		}, track.fade.in * 1000);
	}
	input.start(0, (startTime ?? track.pausedAt) + track.edit.in);
	track.startedAt = ctx.currentTime - (startTime ?? track.pausedAt);
	track.playing = true;
}

export function stop(reset: boolean = false, useFade: boolean = false) {
	const end = () => {
		input = new AudioBufferSourceNode(ctx, { buffer: track.buffer });
		setupAudioChain();
		track.pausedAt = reset ? 0 : ctx.currentTime - track.startedAt;
		track.timeCode = reset ? 0 : track.timeCode;
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
		track.timeCode = ctx.currentTime - track.startedAt;
	}
}

onMount(() => {
	load();
});

//length of track after editing
$effect(() => {
	cutTrackLength = track.length ? track.length - track.edit.in : 0;
});
//set pan value
$effect(() => {
	if (panNode) {
		panNode.pan.value = track.pan;
	}
});
//set volume
$effect(() => {
	gainNode.gain.setValueAtTime(track.volume / 100, ctx.currentTime);
});
//reset dragover
$effect(() => {
	if ($currentDragging == null) {
		dragover = null;
	}
});
//load if not loaded or missing
$effect(() => {
	if (!track.loaded) {
		if (!track.missing) load();
	}
});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="playlist-item track"
	class:selected={$selectedItem == id}
	class:track.missing
	class:drag-top={dragover == "bottom"}
	class:drag-bottom={dragover == "top"}
	class:loaded={track.buffer != undefined}
	draggable={$editMode}
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
	ondragover={handleDragEnter}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={() => selectedItem.set(id)}
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
		style={`
			${$currentDragging == null ? "" : "pointer-events: none;"}
			height: ${$playlistZoom}rem;
			padding-bottom: ${$playlistZoom > 60 ? 20 : 0 }rem;
			padding-left: ${$playlistZoom < 60 ? ($playlistZoom - 40) / 2 : ($playlistZoom - 60) / 2}px;
			padding-right: ${$playlistZoom < 60 ? ($playlistZoom - 40) / 2 : ($playlistZoom - 60) / 2}px;
		`}
	>
		<!--progress-->
		{#if $playlistZoom > 60}
		<div
			class="progress"
			onclick={handleSkip}
			style={`
				background: linear-gradient(
					90deg,
					var(--accent) 0%,
					var(--accent) calc(100% * ${track.timeCode / cutTrackLength}),
					#555 calc(100% * ${track.timeCode / cutTrackLength}),
					#555 100%
				);`}
		></div>

		<Waveform
			buffer={track.buffer}
			cutInFac={track.edit.in / track.length}
			samples={1000}
			resY={50}
		/>
		{/if}

		<!--reset-btn-->
		{#if $settings.resetButton}
			<button
				id="btn-reset"
				class="play-btn"
				title="Reset"
				onclick={() => {
					stop(true);
				}}
			>
				<img src="./icons/topbar/reset.svg" alt="" draggable="false" />
			</button>
		{/if}

		<!--play Button-->
		<button
			id="btn-play"
			class="play-btn"
			title="Play"
			class:active={track.playing}
			onclick={playPause}
		>
			{#if track.inFade != null}
				<img
					src="./icons/topbar/fade.svg"
					alt=""
					draggable="false"
					class="fade-timeCode-icon"
				/>
			{:else if track.playing}
				<img src="./icons/topbar/pause.svg" alt="" draggable="false" />
			{:else}
				<img src="./icons/topbar/play.svg" alt="" draggable="false" />
			{/if}
		</button>

		<!--name-->
		{#if track.buffer}
			<div class="title">
				<!--Icon-->
				<img src="./icons/topbar/music.svg" alt="" class="icon" />

				{#if titleIsEditing}
					<input
						class="title-input"
						type="text"
						bind:this={titleEl}
						bind:value={track.name}
						onblur={() => {
							titleIsEditing = false;
							isEditing.update(e => e - 1);
						}}
						onkeydown={e => {
							if (e.key === "Enter") {
								titleIsEditing = false;
							}
						}}
					/>
				{:else}
					<span
						class="title-display"
						ondblclick={() => {
							if (!$editMode) return;
							titleIsEditing = true;
							isEditing.update(e => e + 1);
							tick().then(() => {
								titleEl.focus();
							});
						}}>{track.name}</span
					>
				{/if}
			</div>
		{:else if track.missing}
			<div class="title">
				<p class="title-display">{"File not found: " + track.path}</p>
			</div>
		{:else}
			<div class="title"><p class="title-display">Loading...</p></div>
		{/if}

		<!--Hotkey Display-->
		{#if track.hotkey != undefined}
			<div class="hotkey-display">
				<p>{track.hotkey}</p>
			</div>
		{/if}

		<!--Display Repeat-->
		{#if track.repeat && !$editMode}
			<img
				class="option-display"
				src="./icons/topbar/repeat.svg"
				alt=""
				draggable="false"
			/>
		{/if}

		<!--Display Reset-->
		{#if track.autoReset && !$editMode}
			<img
				class="option-display"
				src="./icons/topbar/reset.svg"
				alt=""
				draggable="false"
			/>
		{/if}

		<!--fade Display-->
		{#if !$editMode && track.fade.in > 0}
			<img
				class="fade-display"
				src="./icons/topbar/fade_in.svg"
				alt=""
				draggable="false"
			/>
		{/if}

		{#if !$editMode && track.fade.out > 0}
			<img
				class="fade-display"
				src="./icons/topbar/fade_out.svg"
				alt=""
				draggable="false"
			/>
		{/if}

		<!--time-->
		{#if !$editMode}
			<p class="timecode">{secondsToMinutes(track.timeCode)}</p>
		{/if}
		<p class="length">
			{cutTrackLength != null ? secondsToMinutes(cutTrackLength) : "--:--"}
		</p>

		{#if $editMode}
			<div class="options" class:stacked={$playlistZoom > 94}>
				<!--Hotkey-->
				<div class="option hotkey" class:assigned={track.hotkey != undefined}>
					<select bind:value={hotkeySelect} onchange={handleHotkeySelect}>
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
					id="btn-repeat"
					class="option repeat-btn"
					class:active={track.repeat}
					onclick={() => {
						track.repeat = $editMode ? !track.repeat : track.repeat;
					}}
					title="repeat track"
				>
					<img src="./icons/topbar/repeat.svg" alt="repeat" draggable="false" />
				</button>

				<!--auto reset-->
				<button
					id="btn-auto-reset"
					class="option auto-reset-btn"
					class:active={track.autoReset}
					onclick={() => {
						track.autoReset = $editMode ? !track.autoReset : track.autoReset;
					}}
					title="auto reset track on pause"
				>
					<img
						src="./icons/topbar/auto_reset.svg"
						alt="auto reset"
						draggable="false"
					/>
				</button>
			</div>
		{/if}

		<!--fade-->
		{#if $settings.showFadeOptions && $editMode}
			<span class="fade" class:stacked={$playlistZoom > 94}>
				<div class="fader">
					<img class="fade-icon" src="./icons/topbar/fade_in.svg" alt="" />
					<PropNumber
						bind:value={track.fade.in}
						onFocus={() => isEditing.update(e => e + 1)}
						onBlur={() => isEditing.update(e => e - 1)}
						min={0}
						max={track.length}
						decimalDisplay={0}
						unit="s"
						disabled={!$editMode}
						title="Fade In"
					/>
				</div>
				<div class="fader">
					<img class="fade-icon" src="./icons/topbar/fade_out.svg" alt="" />
					<PropNumber
						bind:value={track.fade.out}
						onFocus={() => isEditing.update(e => e + 1)}
						onBlur={() => isEditing.update(e => e - 1)}
						min={0}
						max={track.length}
						decimalDisplay={0}
						unit="s"
						disabled={!$editMode}
						title="Fade out"
					/>
				</div>
			</span>
		{/if}

		<!--volume Pan-->
		{#if $settings.showVolumeOptions && $editMode}
			<VolumeControl
				bind:volume={track.volume}
				bind:pan={track.pan}
				slider={$settings.useSliders}
			/>
		{/if}
	</div>
</div>
