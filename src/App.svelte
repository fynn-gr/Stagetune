<script lang="ts">
	import "../src/pureUI/scss/index.scss";
	import "./style/App.scss";
	import { onMount } from "svelte";
	import { listen } from "@tauri-apps/api/event";
	import { appWindow } from "@tauri-apps/api/window";
	import { confirm } from "@tauri-apps/api/dialog";
	import { invoke } from "@tauri-apps/api/tauri";

	import PlayListTrack from "./lib/PlayListTrack.svelte";
	import PlayListAnotation from "./lib/PlayListAnotation.svelte";
	import PlayListVideo from "./lib/PlayListVideo.svelte";
	import TrackListItem from "./lib/TrackListItem.svelte";
	import TopBar from "./lib/TopBar.svelte";
	import Hotkey from "./lib/Hotkey.svelte";
	import HotkeyPlaceholder from "./lib/HotkeyPlaceholder.svelte";
	import Waveform from "./lib/Waveform.svelte";

	import {
		editMode,
		currentDragging,
		uiPlatform,
		playlist,
		selectedItem,
		srcFiles,
		playlistPath,
		srcPaths,
		isEditing,
		hotkeys,
		localFiles,
	} from "./stores";
	import {
		openPlaylist,
		savePlaylist,
		fileNameFromPath,
		openDir,
		createPlaylistTrack,
		waveformCalc,
	} from "./utils";
	import type { playListItem } from "@/utils";
	import PlayListLoop from "./lib/PlayListLoop.svelte";
	import Splash from "./lib/Splash.svelte";
	import Annotation from "./lib/Annotation.svelte";

	let playlistElement: HTMLElement;
	let meterCanvas: HTMLCanvasElement;
	let meterCtx: CanvasRenderingContext2D;

	let splashScreen = false;
	let playlistElements = [];
	let hotkeyElements = [];
	let sideBar = true;
	let editorPanel = false;
	let projector = false;
	let palettes = true;
	//let zoom = 1.2;

	const ctx = new AudioContext();
	const analyser = ctx.createAnalyser();
	const masterGain = ctx.createGain();
	masterGain.connect(analyser).connect(ctx.destination);

	/*
	analyser.fftSize = 32;
	const bufferLength = analyser.frequencyBinCount;
	const dataArray = new Uint8Array(bufferLength);
	analyser.getByteTimeDomainData(dataArray);
	*/

	//$: console.log($isEditing)
	//$: document.documentElement.style.fontSize = `${zoom}px`;

	function openVideoWindow(show: boolean) {
		invoke("show_projector", { invokeMessage: show ? "true" : "false" });
	}

	function handleDropPlaylist(e) {
		console.log("grag on playlist")
		e.preventDefault();
		if ($currentDragging.origin == "src") {
			$playlist.push(
				createPlaylistTrack(
					"playlist",
					$currentDragging.type,
					$currentDragging.path,
					$currentDragging.name
				)
			);
			playlist.set($playlist);
			$currentDragging = null;
		} else if ($currentDragging.origin == "playlist") {
			let oldPosition = $playlist.indexOf($currentDragging);
			playlist.update((e) => {
				e.splice(oldPosition, 1);
				return e;
			});
			$playlist.push($currentDragging);
			$playlist = $playlist;

			$currentDragging = null;
		} else {
			$currentDragging = null;
		}
	}

	function stopAll(playlist: boolean, hotkeys: boolean) {
		if (hotkeys) {
			for (let i = 0; i < hotkeyElements.length; i++) {
				hotkeyElements[i].createInput(true);
			}
		}
	}

	function moveUp() {
		console.log($selectedItem)
		$selectedItem > 0 ? selectedItem.update((n) => n - 1) : selectedItem.set(0);
		console.log($selectedItem)
		//if (playlist[selectedItem].text != null) {
		//	moveUp();
		//}
	}

	function moveDown() {
		console.log($selectedItem)
		$selectedItem < $playlist.length - 1
			? selectedItem.update((n) => n + 1)
			: selectedItem;
		console.log($selectedItem)
		//if (playlist[selectedItem].text != null) {
		//	moveDown();
		//}
	}

	const unlisten = listen("menu", async (event) => {
		console.log(event);
		if (event.payload == "quit") {
			if ($editMode) {
				const confirmed = await confirm(
					"Do you want to discard all unsaved changes?",
					{ title: "Quit?", type: "warning", okLabel: "Quit" }
				).then((isOK) => (isOK ? appWindow.close() : null));
			}
		} else if (event.payload == "new") {
		} else if (event.payload == "open") {
			openPlaylist();
		} else if (event.payload == "save") {
			savePlaylist();
		} else if (event.payload == "save_as") {
			savePlaylist(true);
		} else if (event.payload == "add") {
			openDir();
		} else if (event.payload == "projector") {
			openVideoWindow(!projector);
			projector = !projector;
		}
	});

	function drawMeter() {
		//requestAnimationFrame(drawMeter);

		analyser.getByteTimeDomainData(dataArray);

		meterCtx.fillStyle = "rgb(200, 200, 200)";
		meterCtx.fillRect(0, 0, meterCanvas.width, meterCanvas.height);

		for (let i = 0; i < bufferLength; i++) {
			const v = dataArray[i] / 128.0;
			const y = (v * meterCanvas.height) / 1.5;
			console.log(v, y)

			//meterCtx.lineTo(x, y);
			meterCtx.fillStyle = "rgb(256, 0, 0)";
			meterCtx.fillRect(0, meterCanvas.height - y, meterCanvas.width, meterCanvas.height)
		}
	}

	onMount(() => {
		//shortcuts
		document.addEventListener("keydown", (e) => {
			//console.log(e)

			if ($isEditing > 0) {
				console.log("is Editing")
				return;
			} else {
				if ($editMode) {
					//open Playlist
					if (e.code == "KeyO" && e.ctrlKey) {
						openPlaylist();
					} else if (e.code == "KeyA" && e.ctrlKey) {
						openDir();
					}

					// openVideoWindow
					else if (e.code == "KeyP" && e.ctrlKey) {
						openVideoWindow(!projector);
						projector = !projector;
					}

					//delete playlist item
					else if (e.code == "Backspace" || e.code == "Delete") {
						//stop track if playing
						if ($playlist[$selectedItem].playing)
							playlistElements[$selectedItem].stop();

						let toDelete = $selectedItem;
						//find new selected item
						if ($playlist.length - 1 > $selectedItem) $selectedItem++;
						else if ($selectedItem > 0) $selectedItem--;
						else $selectedItem = null;
						playlist.update((e) => {
							e.splice(toDelete, 1);
							return e;
						});
						$playlist = $playlist;
					}
				}

				//move up
				if (
					(e.code === "KeyW" || e.code === "ArrowUp") &&
					!e.ctrlKey &&
					!e.metaKey
				) {
					moveUp();
				}
				//move down
				else if (
					(e.code === "KeyS" || e.code === "ArrowDown") &&
					!e.ctrlKey &&
					!e.metaKey
				) {
					moveDown();
				}
				//reset song
				else if (
					(e.code === "KeyA" || e.code === "ArrowLeft") &&
					!e.ctrlKey &&
					!e.metaKey
				) {
					playlist.update((items) => {
						playlistElements[$selectedItem].stop(true);
						return items;
					});
				}
				//skip song
				else if (
					(e.code === "KeyD" || e.code === "ArrowRight") &&
					!e.ctrlKey &&
					!e.metaKey
				) {
					playlist.update((items) => {
						playlistElements[$selectedItem].stop(true);
						selectedItem.update((n) => n + 1);
						playlistElements[$selectedItem].play(0);
						return items;
					});
				}
				//play
				else if (e.code === "Space") {
					playlistElements[$selectedItem].playPause();
				}
				//save File
				else if (e.code == "KeyS" && e.ctrlKey) {
					savePlaylist();
				}
			}
		});

		const interval = setInterval(() => {
			//console.log(playlistElements);
			for (let i = 0; i < playlistElements.length; i++) {
				playlistElements[i].update();
				//console.log("peak: ", peak)
			}
			//drawMeter()
			//console.timeEnd("update");
		}, 300);

		return () => clearInterval(interval);
	});

	$: console.log($isEditing)
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if splashScreen}
	<Splash bind:splashScreen />
{/if}

<main class={"window-body dark " + $uiPlatform}>

	<!--SideBar-->
	<div
		class="side-bar"
		style={`width: ${sideBar ? "300" : "0"}px;`}
	>
		{#if $editMode}
			<div class="trackList">
				{#each $srcFiles as p, i}
					<p class="category">
						{fileNameFromPath($srcPaths[i])}
					</p>

					{#each p as e}
						<TrackListItem entry={e} />
					{/each}
				{/each}
				<p class="category">standart</p>
				{#each $localFiles as l}
					<TrackListItem entry={l} />
				{/each}
			</div>
		<!--
			<div class="meter">
				<canvas
					class="can-meter"
					bind:this={meterCanvas}
					width="30"
					height="500"
				>

				</canvas>
			</div>
		-->
		{/if}
	</div>

	<!--TopBar-->
	<TopBar bind:sideBar bind:editor={editorPanel} bind:palettes />

	<!--playlist-->
	<!-- svelte-ignore a11y-mouse-events-have-key-events -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="playlist"
		bind:this={playlistElement}
		on:drop={handleDropPlaylist}
		on:dragover={(e) => {
			e.preventDefault();
			return false;
		}}
	>
		{#if $playlist.length > 0}
			{#each $playlist as t, i}
				{#if t.type == "track"}
					<PlayListTrack
						bind:this={playlistElements[i]}
						bind:track={t}
						id={i}
						{ctx}
						{masterGain}
					/>
				{:else if t.type == "video"}
					<PlayListVideo
						bind:this={playlistElements[i]}
						bind:track={t}
						id={i}
					/>
				{:else if t.type == "annotation"}
					<PlayListAnotation
						bind:this={playlistElements[i]}
						bind:item={t}
						id={i}
					/>
				{:else if t.type == "loop"}
					<PlayListLoop
						bind:this={playlistElements[i]}
						bind:track={t}
						id={i}
						{ctx}
						{masterGain}
					/>
				{/if}
			{/each}
		{:else}
			<p class="placeholder">Drag Track here</p>
		{/if}
	</div>

	<!--editor-->
	{#if editorPanel && $editMode}
		<div class="editor">
			{#if $selectedItem != null && $selectedItem != undefined && $playlist[$selectedItem].type == "track"}
				<div class="prop-bar">
					<label>start</label>
					<input
						type="number"
						bind:value={$playlist[$selectedItem].edit.in}
						on:focus={() => {
							isEditing.update((e) => e + 1);
						}}
						on:blur={() => {
							isEditing.update((e) => e - 1);
						}}
					/>
					<label>fade in</label>
					<input
						type="number"
						bind:value={$playlist[$selectedItem].fade.in}
						on:focus={() => {
							isEditing.update((e) => e + 1);
						}}
						on:blur={() => {
							isEditing.update((e) => e - 1);
						}}
					/>
					<label>fade in</label>
					<input
						type="number"
						bind:value={$playlist[$selectedItem].fade.out}
						on:focus={() => {
							isEditing.update((e) => e + 1);
						}}
						on:blur={() => {
							isEditing.update((e) => e - 1);
						}}
					/>
				</div>

				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class="track"
					on:click={(e) => {
						let rec = e.target.getBoundingClientRect();
						let x = e.clientX - rec.left;
						let perc = Math.min(Math.max(x / rec.width, 0), 1);
						$playlist[$selectedItem].edit.in =
							perc * $playlist[$selectedItem].length;
					}}
				>
					<Waveform
						data={
							waveformCalc(playlistElements[$selectedItem].getBuffer(),
							window.innerWidth)
						}
						samples={window.innerWidth}
						resY={200}
					/>
					<div
						class="resizer"
						style={`width: ${
							($playlist[$selectedItem].edit.in /
								$playlist[$selectedItem].length) *
							100
						}%;`}
					/>
				</div>
			{:else}
				<p>No track selected</p>
			{/if}
		</div>
	{/if}

	<!--palettes on the right-->
	{#if palettes || !$editMode}
		<div class="palettes">
			<!--current playing-->
			<div class="current">
				{#each $playlist as e}
					{#if e.playing != undefined && e.state != 0}
						<div class="song">
							<div
								class="state"
								class:playing={e.playing}
								style={`width: calc(100% * ${
									e.state != undefined ? e.state / e.length : 0
								});`}
							/>
							<p>{e.name}</p>
						</div>
					{/if}
				{/each}
			</div>

			<!--hotkeys-->
			<div class="hotkeys">
				{#each $hotkeys as a, i}
					{#if a.path != ""}
						<Hotkey
							bind:track={a}
							bind:this={hotkeyElements[i]}
							{ctx}
							{stopAll}
						/>
					{:else}
						<HotkeyPlaceholder bind:track={a} bind:this={hotkeyElements[i]} />
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	<div class="window-rim" />
</main>
