<script lang="ts">
	import "../src/pureUI/scss/index.scss";
	import "./style/App.scss";
	import { onMount } from "svelte";
	import { emit, listen } from "@tauri-apps/api/event";
	import { confirm } from "@tauri-apps/api/dialog";
	import { invoke } from "@tauri-apps/api/tauri";
	import { exit } from "@tauri-apps/api/process";
	import { appWindow } from "@tauri-apps/api/window";

	import PlayListTrack from "./lib/PlayListTrack.svelte";
	import PlayListAnotation from "./lib/PlayListAnotation.svelte";
	import PlayListVideo from "./lib/PlayListVideo.svelte";
	import TrackListItem from "./lib/TrackListItem.svelte";
	import TopBar from "./lib/TopBar.svelte";
	import Hotkey from "./lib/Hotkey.svelte";
	import Waveform from "./lib/Waveform.svelte";
	import Splash from "./lib/Splash.svelte";

	import {
		editMode,
		currentDragging,
		uiPlatform,
		playlist,
		selectedItem,
		srcFiles,
		playlistElements,
		hotkeyElements,
		isEditing,
		hotkeys,
		localFiles,
		settings,
	} from "./stores";
	import {
		savePlaylist,
		fileNameFromPath,
		openDir,
		createPlaylistTrack,
		waveformCalc,
		updateProjectorList,
		loadSettings,
		setUIScale,
	} from "./utils";

	let meterCanvas: HTMLCanvasElement;
	let meterCtx: CanvasRenderingContext2D;

	let splashScreen = false;
	let sideBar = true;
	let editorPanel = false;
	let projector = false;
	let palettes = true;
	loadSettings();
	setUIScale($settings.ui_scale);

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

	function openVideoWindow(show: boolean) {
		invoke("show_projector", { invokeMessage: show ? "true" : "false" });
	}

	function openSettings() {
		invoke("open_settings", { invokeMessage: JSON.stringify($settings) });
	}

	function handleDropPlaylist(e) {
		e.preventDefault();
		if ($currentDragging.origin == "playlist") {
			console.log("drop form playlist", e )
			let oldPosition = $playlist.indexOf($currentDragging);
			playlist.update((e) => {
				e.splice(oldPosition, 1);
				return e;
			});
			$playlist.push($currentDragging);
			$playlist = $playlist;
		} else if ($currentDragging.origin == "src") {
			console.log("drop form src", e )
			$playlist.push(
				createPlaylistTrack(
					"playlist",
					$currentDragging.type,
					$currentDragging.path,
					$currentDragging.name
				)
			);
			playlist.set($playlist);
		} else {
		}
		$currentDragging = null;
	}

	function moveUp() {
		$selectedItem > 0 ? selectedItem.update((n) => n - 1) : selectedItem.set(0);
		//if (playlist[selectedItem].text != null) {
		//	moveUp();
		//}
	}

	function moveDown() {
		$selectedItem < $playlist.length - 1
			? selectedItem.update((n) => n + 1)
			: selectedItem;
		//if (playlist[selectedItem].text != null) {
		//	moveDown();
		//}
	}

	function pauseAll() {
		for (let i = 0; i < $playlistElements.length; i++) {
			$playlistElements[i].stop(false, false)
		}
	}

	function resetAll() {
		for (let i = 0; i < $playlistElements.length; i++) {
			$playlistElements[i].stop(true, false)
		}
	}

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

	const unlistenMenus = listen("menu", async (event) => {
		console.log(event);
		if (event.payload == "quit" && $editMode) {
			const confirmed = await confirm(
				"Do you want to discard all unsaved changes?",
				{ title: "Quit?", type: "warning", okLabel: "Quit" }
			).then((isOK) => (isOK ? exit(0) : null));
		} else if (event.payload == "open"  && $editMode) {
			openDir();
		} else if (event.payload == "save") {
			savePlaylist();
		} else if (event.payload == "projector") {
			openVideoWindow(!projector);
			projector = !projector;
		} else if (event.payload == "settings" && $editMode) {
			openSettings();
		}
	});

	const unlistenProjectorReq = listen("projctorReq", (e) => {
		updateProjectorList();
	})

	const unlistenUpdateSettings = listen("update_settings", () => {
		loadSettings(); 
	}) 

	onMount(() => {

		//shortcuts
		document.addEventListener("keydown", (e) => {
			console.log(e)

			if ($isEditing > 0) {
				return;
			} else {
				if ($editMode) {
					//open Playlist
					if (e.code == "KeyO" && e.ctrlKey) {
						e.preventDefault();
						openDir();
					}

					// openVideoWindow
					else if (e.code == "KeyP" && e.ctrlKey) {
						e.preventDefault();
						openVideoWindow(!projector);
						projector = !projector;
					}

					//delete playlist item
					else if (e.code == "Backspace" || e.code == "Delete") {
						e.preventDefault();
						//stop track if playing
						if ($playlist[$selectedItem].playing)
							$playlistElements[$selectedItem].stop();

						let toDelete = $selectedItem;
						//find hotkey
						if ($playlist[$selectedItem].hotkey != undefined) {
							let hotkeyRm = $playlist[$selectedItem].hotkey;
							console.log(hotkeyRm);
							$hotkeys[hotkeyRm - 1].track = null;
						}
						//find new selected item
						if ($playlist.length - 1 > $selectedItem) $selectedItem++;
						else if ($selectedItem > 0) $selectedItem--;
						else $selectedItem = null;
						//delte from playlist
						playlist.update((e) => {
							e.splice(toDelete, 1);
							return e;
						});
						$playlist = $playlist;
					}

					//open Preferences
					else if (e.code == "Comma" && e.ctrlKey) {
						e.preventDefault();
						openSettings();
					}
				}

				//move up
				if (
					(e.code === "KeyW" || e.code === "ArrowUp") &&
					!e.ctrlKey &&
					!e.metaKey
				) {
					e.preventDefault();
					moveUp();
				}
				//move down
				else if (
					(e.code === "KeyS" || e.code === "ArrowDown") &&
					!e.ctrlKey &&
					!e.metaKey
				) {
					e.preventDefault();
					moveDown();
				}
				//reset song
				else if (
					(e.code === "KeyA" || e.code === "ArrowLeft") &&
					!e.ctrlKey &&
					!e.metaKey
				) {
					e.preventDefault();
					playlist.update((items) => {
						$playlistElements[$selectedItem].stop(true);
						return items;
					});
				}
				//skip song
				else if (
					(e.code === "KeyD" || e.code === "ArrowRight") &&
					!e.ctrlKey &&
					!e.metaKey
				) {
					e.preventDefault();
					playlist.update((items) => {
						$playlistElements[$selectedItem].stop(true);
						selectedItem.update((n) => n + 1);
						$playlistElements[$selectedItem].play(0);
						return items;
					});
				}
				//play
				else if (e.code === "Space") {
					e.preventDefault();
					$playlistElements[$selectedItem].playPause();
				}
				//save File
				else if (e.code == "KeyS" && e.ctrlKey) {
					e.preventDefault();
					savePlaylist();
				}
			}
		});

		document.addEventListener("contextmenu", e => {
			//e.preventDefault();
		})
		
		const interval = setInterval(() => {
			for (let i = 0; i < $playlistElements.length; i++) {
				$playlistElements[i].update();
			}
			//drawMeter()
		}, 300);

		return () => clearInterval(interval);
		
	});

	$: console.log($isEditing)
	$: emit("editMode", {edit: $editMode});
	$: if($editMode) {
		appWindow.setResizable(true);
		//appWindow.setMinimizable(true);
		//appWindow.setClosable(true);
	} else {
		appWindow.setResizable(false);
		//appWindow.setMinimizable(false);
		//appWindow.setClosable(false);
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if $settings.show_splash}
	<Splash bind:splashScreen={$settings.show_splash} />
{/if}

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<main class={"window-body dark " + $uiPlatform}>

	<!--SideBar-->
	<div
		class="side-bar"
		class:exposed={sideBar}
	>
		{#if $editMode}
			<div class="trackList">
				{#each $srcFiles as p, i}
					<TrackListItem entry={p} />
				{/each}
				<p class="category">videos</p>
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
	<TopBar bind:sideBar bind:editor={editorPanel} bind:palettes {pauseAll} {resetAll}/>

	<!--playlist-->
	<div
		class="playlist"
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
						bind:this={$playlistElements[i]}
						bind:track={t}
						id={i}
						{ctx}
						{masterGain}
					/>
				{:else if t.type == "video"}
					<PlayListVideo
						bind:this={$playlistElements[i]}
						bind:track={t}
						id={i}
					/>
				{:else if t.type == "annotation"}
					<PlayListAnotation
						bind:this={$playlistElements[i]}
						bind:item={t}
						id={i}
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
							waveformCalc($playlistElements[$selectedItem].getBuffer(),
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
				<p class="placeholder">No track playing</p>
			</div>

			<!--hotkeys-->
			<div class="hotkeys">
				{#each $hotkeys as a, i}
					<Hotkey
						bind:this={$hotkeyElements[i]}
						bind:track={a.track}
						key={a.key}
					/>
				{/each}
			</div>
		</div>
	{/if}

	<div class="window-rim" />
</main>
