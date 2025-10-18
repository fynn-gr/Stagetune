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
import { DropHandler, secondsToMinutes, waveformCalc } from "@/ts/Utils";
import {
	editMode,
	selectedItem,
	isEditing,
	currentDragging,
	settings,
	draggingOrigin,
	hotkeys,
} from "../ts/Stores.svelte";

interface Props {
	type: "track"; // type of item
	path: string; //relative path
	pathSource: string; // absolute path of the folder
	name: string; //title of the item
	length: number; //track duration
	playing: boolean; //is currently playing
	timeCode: number; //seconds playhead is at, not including cut In
	volume: number; //sound volume, deafult is 80 out of 100
	pan: number; //stereo pan -1 to 1
	repeat: boolean; //repeat track option is on
	autoReset: boolean; //auto reset after pause option is on
	edit: { in: number; out: number }; //cut second at beginning and end (only beginning is implemented)
	fade: { in: number; out: number }; //sedonds to fade in and out
	annotation: { text: string; color: string | null } | null; //annotation text and color, if the item is an annotation, this is also the prop used
	buffer: AudioBuffer | null; //audio buffer
	startedAt: number; //track was started at seconds
	pausedAt: number; // track was paused at seconds
	inFade: "in" | "out" | null; //track is currently in fade or null
	hotkey: number | null; //hotkey number assigned, null if not assigned
	missing: boolean; //true if file could not be found
	loaded: boolean; //if track finished loading
	id: number;
	ctx: AudioContext;
	masterGain: GainNode;
}
let {
	type = $bindable(),
	path = $bindable(),
	pathSource = $bindable(),
	name = $bindable(),
	length = $bindable(),
	playing = $bindable(),
	timeCode = $bindable(),
	volume = $bindable(),
	pan = $bindable(),
	repeat = $bindable(),
	autoReset = $bindable(),
	edit = $bindable(),
	fade = $bindable(),
	annotation = $bindable(),
	buffer = $bindable(),
	startedAt = $bindable(),
	pausedAt = $bindable(),
	inFade = $bindable(),
	hotkey = $bindable(),
	missing = $bindable(),
	loaded = $bindable(),
	id,
	ctx,
	masterGain,
}: Props = $props();

let hotkeySelect: number | undefined = $state(undefined);
let dragging = $state(false);
let dragover: "top" | "bottom" | null = $state(null);
let titleEl: HTMLElement;
let titleIsEditing = $state(false);
let cutIn: number = $state(0);
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
		if ($hotkeys[hotkeySelect - 1].track != null) {
			//remove old track at hotkey
			$hotkeys[hotkeySelect - 1].track.hotkey = null;
			$hotkeys[hotkeySelect - 1].track = null;
		}
		if (hotkey != undefined) {
			//remove old hotkey from current track first
			$hotkeys[hotkey].track = null;
		}
		//set new hotkey
		hotkey = hotkeySelect;
		$hotkeys[hotkeySelect - 1].track = track;
	} else {
		//selected undefined
		$hotkeys[hotkey].track = null;
		hotkey = null;
	}
}

function onEnd() {
	if (ctx.currentTime - startedAt! >= (length! - cutIn) * 0.96) {
		if (repeat) {
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

		if (playing) {
			stop();
			play(cutTrackLength! * skipFac);
			timeCode = cutTrackLength! * skipFac;
		} else {
			pausedAt = cutTrackLength! * skipFac;
			timeCode = cutTrackLength! * skipFac;
		}
	}
}

async function load() {
	//load file
	const absPath = await join(pathSource, path);
	console.log("loading track: ", absPath);

	//test file exist to throw error if file missing
	if (await exists(absPath)) {
		console.log(convertFileSrc(absPath));
		const response = await fetch(convertFileSrc(absPath));
		const arrayBuffer = await response.arrayBuffer();
		buffer = await ctx.decodeAudioData(arrayBuffer);
		input = new AudioBufferSourceNode(ctx, { buffer: buffer });
		loaded = true;
		length = buffer.duration;
	} else {
		//file not found
		console.error(convertFileSrc(absPath), "track not found");
		missing = true;
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
	playing ? stop(autoReset, true) : play(undefined, true);
}

export function play(
	startTime: number | undefined = undefined,
	useFade: boolean = false,
) {
	//resume track
	if (playing) return;

	if (fade.in > 0 && inFade == null && useFade) {
		inFade = "in";
		fadeNode.gain.setValueAtTime(0.01, 0);
		fadeNode.gain.linearRampToValueAtTime(1, ctx.currentTime + fade.in);
		setTimeout(() => {
			inFade = null;
		}, fade.in * 1000);
	}
	input.start(0, (startTime ?? pausedAt) + cutIn);
	startedAt = ctx.currentTime - (startTime ?? pausedAt);
	playing = true;
}

export function stop(reset: boolean = false, useFade: boolean = false) {
	const end = () => {
		input = new AudioBufferSourceNode(ctx, { buffer: buffer });
		setupAudioChain();
		pausedAt = reset ? 0 : ctx.currentTime - startedAt;
		timeCode = reset ? 0 : timeCode;
	};
	if (playing) {
		if (inFade && !useFade) {
			inFade = null;
			fadeNode.gain.setValueAtTime(1, ctx.currentTime);
			input.stop();
			end();
		} else if (fade.out > 0 && !inFade && useFade) {
			inFade = "out";
			fadeNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + fade.out);
			setTimeout(() => {
				input.stop();
				end();
				inFade = null;
				playing = false;
			}, fade.out * 1000);
		} else {
			input.stop();
			end();
			playing = false;
		}
	} else {
		end();
	}
}

export function getBuffer(): AudioBuffer {
	return buffer as AudioBuffer;
}

export function update() {
	if (playing) {
		timeCode = ctx.currentTime - startedAt;
	}
}

onMount(() => {
	load();
});

$effect(() => {
	cutIn = edit.in;
});
$effect(() => {
	cutTrackLength = length ? length - cutIn : 0;
});
$effect(() => {
	if (panNode) {
		panNode.pan.value = pan;
	}
});
$effect(() => {
	gainNode.gain.setValueAtTime(volume / 100, ctx.currentTime);
});
$effect(() => {
	if ($currentDragging == null) {
		dragover = null;
	}
});
$effect(() => {
	if (!loaded) {
		if (!missing) load();
	}
});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="playlist-item track"
	class:selected={$selectedItem == id}
	class:missing
	class:drag-top={dragover == "bottom"}
	class:drag-bottom={dragover == "top"}
	class:loaded={buffer != undefined}
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
		<Annotation bind:annotation {id} />
	{/if}

	<div
		class="inner"
		style={$currentDragging == null ? "" : "pointer-events: none;"}
	>
		<!--progress-->
		<div
			class="progress"
			onclick={handleSkip}
			style={`
				background: linear-gradient(
					90deg,
					var(--accent) 0%,
					var(--accent) calc(100% * ${timeCode / cutTrackLength}),
					#555 calc(100% * ${timeCode / cutTrackLength}),
					#555 100%
				);`}
		></div>

		<Waveform
			data={waveformCalc(buffer, 1000, cutIn / length)}
			samples={1000}
			resY={50}
		/>

		<!--reset-btn-->
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

		<!--play Button-->
		<button
			id="btn-play"
			class="play-btn"
			title="Play"
			class:active={playing}
			onclick={playPause}
		>
			{#if inFade != null}
				<img
					src="./icons/topbar/fade.svg"
					alt=""
					draggable="false"
					class="fade-timeCode-icon"
				/>
			{:else if playing}
				<img src="./icons/topbar/pause.svg" alt="" draggable="false" />
			{:else}
				<img src="./icons/topbar/play.svg" alt="" draggable="false" />
			{/if}
		</button>

		<!--name-->
		{#if buffer} //loaded successfully
			<div class="title">
				{#if titleIsEditing}
					<input
						class="title-input"
						type="text"
						bind:this={titleEl}
						bind:value={name}
						onblur={() => {
							titleIsEditing = false;
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
							titleIsEditing = true;
							tick().then(() => {
								titleEl.focus();
							});
						}}>{name}</span
					>
				{/if}
			</div>
		{:else if missing}
			<div class="title">
				<p class="input">{"File not found: " + path}</p>
			</div>
		{:else}
			<div class="title"><p class="input">Loading...</p></div>
		{/if}

		<!--Hotkey Display-->
		{#if hotkey != undefined}
			<div class="hotkey-display">
				<p>{hotkey}</p>
			</div>
		{/if}

		<!--Display Repeat-->
		{#if repeat && !$editMode}
			<img
				class="option-display"
				src="./icons/topbar/repeat.svg"
				alt=""
				draggable="false"
			/>
		{/if}

		<!--Display Reset-->
		{#if autoReset && !$editMode}
			<img
				class="option-display"
				src="./icons/topbar/reset.svg"
				alt=""
				draggable="false"
			/>
		{/if}

		<!--fade Display-->
		{#if !$editMode && fade.in > 0}
			<img
				class="fade-display"
				src="./icons/topbar/fade_in.svg"
				alt=""
				draggable="false"
			/>
		{/if}

		{#if !$editMode && fade.out > 0}
			<img
				class="fade-display"
				src="./icons/topbar/fade_out.svg"
				alt=""
				draggable="false"
			/>
		{/if}

		<!--time-->
		<p class="timecode">{secondsToMinutes(timeCode)}</p>
		<p class="length">
			{cutTrackLength != null ? secondsToMinutes(cutTrackLength) : "--:--"}
		</p>

		<div class="options">
			<!--Hotkey-->
			<div class="option hotkey" class:assigned={hotkey != undefined}>
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
				<p class:unset={hotkey == undefined}>{hotkey || "?"}</p>
			</div>

			<!--repeat-->
			<button
				id="btn-repeat"
				class="option repeat-btn"
				class:active={repeat}
				onclick={() => {
					repeat = $editMode ? !repeat : repeat;
				}}
				title="repeat track"
			>
				<img src="./icons/topbar/repeat.svg" alt="repeat" draggable="false" />
			</button>

			<!--auto reset-->
			<button
				id="btn-auto-reset"
				class="option auto-reset-btn"
				class:active={autoReset}
				onclick={() => {
					autoReset = $editMode ? !autoReset : autoReset;
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

		<!--fade-->
		{#if $settings.showFadeOptions}
			<span class="fade">
				<img class="fade-icon" src="./icons/topbar/fade_in.svg" alt="" />
				<PropNumber
					bind:value={fade.in}
					onFocus={() => isEditing.update(e => e + 1)}
					onBlur={() => isEditing.update(e => e - 1)}
					min={0}
					max={length}
					decimalDisplay={0}
					unit="s"
					disabled={!$editMode}
					title="Fade In"
				/>
				<img class="fade-icon" src="./icons/topbar/fade_out.svg" alt="" />
				<PropNumber
					bind:value={fade.out}
					onFocus={() => isEditing.update(e => e + 1)}
					onBlur={() => isEditing.update(e => e - 1)}
					min={0}
					max={length}
					decimalDisplay={0}
					unit="s"
					disabled={!$editMode}
					title="Fade out"
				/>
			</span>
		{/if}

		<!--volume Pan-->
		{#if $settings.showVolumeOptions}
			<VolumeControl bind:volume bind:pan slider={$settings.useSliders} />
		{/if}
	</div>
</div>
