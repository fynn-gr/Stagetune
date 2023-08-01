<script lang="ts">
	import { onMount } from "svelte";
	import { convertFileSrc } from "@tauri-apps/api/tauri";
	import { createPlaylistTrack, secondsToMinutes } from "@/utils";
	import { editMode, selectedItem, isEditing, currentDragging, playlist } from "../stores";
	import Annotation from "./Annotation.svelte";
	import Waveform from "./Waveform.svelte";
	import type { playListItem } from "@/utils";

	export let track: playListItem;
	export let id: number;
	export let ctx: AudioContext;
	let dragging = false;
	let missing = false;
	let inFade = false;  //currently in fade, cant start or stop track during fade

	let input: AudioBufferSourceNode;
	let gainNode: GainNode;
	let fadeNode: GainNode;
	let panNode: StereoPannerNode;

	function handleDragStart(e) {
		e.dataTransfer.dropEffect = "copy";
		e.dataTransfer.setData("text/plain", "placehold");
		$currentDragging = track;
		dragging = true;
		//console.log("drag start", e);
	}

	function handleDragEnd(e) {
		dragging = false;
		//console.log("end dragging", e);
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
				e.splice(newPosition, 0, createPlaylistTrack(
					"playlist",
					$currentDragging.type,
					$currentDragging.path,
					$currentDragging.name,
				))
				return e;
			})
			$selectedItem = newPosition;
		} else {

		}
		$currentDragging = null;
	}

	function onEnd() {
		if (track.state >= track.length * 0.99) {
			//reached end of track
			console.log("ended")
			if (track.repeat) {
				stop(true, false)
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
		if(track.playing) {
			console.log(`paused: started: ${track.startedAt}, paused: ${track.pausedAt}, state: ${track.state}`)
			stop(false, true);
		} else {
			console.log(`played: started: ${track.startedAt}, paused: ${track.pausedAt}, state: ${track.state}`)
			play(null, true);
		}
	}

	export function play(startTime: number = null, useFade: boolean = false) {
		//resume track

		if (track.fade.in > 0 && !inFade && useFade) {
			inFade = true;
			fadeNode.gain.setValueAtTime(0.01, 0)
			fadeNode.gain.linearRampToValueAtTime(1, ctx.currentTime + track.fade.in)
			setTimeout(() => {
				inFade = false;
			}, track.fade.in)
		}

		if (startTime == null) {
			input.start(0, track.pausedAt + cutIn);
			track.startedAt = ctx.currentTime - track.pausedAt;
		} else {
			input.start(0, startTime + cutIn);
			track.startedAt = ctx.currentTime - startTime;
		}
		//console.log("resumed at:", track.pausedAt)
		track.playing = true;
	}

	export function stop(reset: boolean = false, useFade: boolean = false) {
		const end = () => {
			input = new AudioBufferSourceNode(ctx, {buffer: track.buffer})
			input.connect(fadeNode);
			input.onended = () => {onEnd()}
			if (reset) {
				console.log("reset song")
				track.pausedAt = 0;
				track.state = 0;
			} else {
				track.pausedAt = ctx.currentTime - track.startedAt;
			}
		}
		//pause track
		if (track.fade.out > 0 && track.playing && !inFade && useFade) {
			inFade = true;
			fadeNode.gain.setValueAtTime(1, ctx.currentTime)
			fadeNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + track.fade.out)
			setTimeout(() => {
				console.log("stop")
				input.stop();
				fadeNode = ctx.createGain();
				fadeNode.connect(gainNode);
				input.connect(fadeNode)
				end();
				inFade = false;
				track.playing = false;
			}, track.fade.out * 1000)
		} else if (track.playing && !inFade) {
			input.stop();
			end();
			track.playing = false;
		} else {
			end();
		}
	}

	export function getBuffer(): AudioBuffer {
		return track.buffer;
	}

	onMount(async () => {
		//load file
		const response = await fetch(convertFileSrc(track.path));
		const arrayBuffer = await response.arrayBuffer();
		track.buffer = await ctx.decodeAudioData(arrayBuffer);
		input = new AudioBufferSourceNode(ctx, {buffer: track.buffer})
		track.length = track.buffer.duration;
		
		//track = track
		console.log(track)
		
		gainNode = ctx.createGain();
		fadeNode = ctx.createGain();
		panNode = ctx.createStereoPanner();
		input.connect(fadeNode).connect(gainNode).connect(panNode).connect(ctx.destination);
		input.onended = () => {onEnd()};

		const loop = async () => {
			await setTimeout(() => {
				if (track.playing) {
					track.state = ctx.currentTime - track.startedAt;
					console.log(fadeNode.gain.value)
				}
				loop();
			}, 200)
		}
		loop();
	});

	$:cutIn = track.edit.in;
	$:cutTrackLength = track.length ? track.length - cutIn : null;
	$:panNode ? panNode.pan.value = track.pan : null;
	$:gainNode ? gainNode.gain.setValueAtTime(track.volume / 100, ctx.currentTime) : null;
	
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
						white calc(100% * ${track.state / cutTrackLength}),
						#0004 calc(100% * ${track.state / cutTrackLength}),
						#0004 100%
					);`
				}
			/>
			<Waveform
				buffer={track.buffer}
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
			{#if track.buffer != undefined}
				<div class="title"><p>{track.name}</p></div>
			{:else}
				<div class="title"><p>loading...</p></div>
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
				{cutTrackLength != null ? secondsToMinutes(cutTrackLength) : "--:--"}
			</p>
	
			<!--fade-->
			<span class="fade">
				<p>Fade in:</p>
				<input type="number" bind:value={track.fade.in} min="0" max={track.length} disabled={!$editMode} />
				<p>Fade out:</p>
				<input type="number" bind:value={track.fade.out} min="0" max={track.length} disabled={!$editMode} />
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
						draggable="true"
						on:dragstart={e => {
							//e.preventDefault()
							//e.stopPropagation()
						}}
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
						draggable="true"
						on:dragstart={e => {
							//e.preventDefault()
							//e.stopPropagation()
						}}
					/>
					<p>R</p>
				</span>
			</div>
		</div>
	
		<!--annotation after-->
		<Annotation bind:annotation={track.annotation} {id} start={false}/>

	</div>
</div>
