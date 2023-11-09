<script lang="ts">
	import "../src/pureUI/scss/index.scss";
	import "./style/App.scss";
	import { onMount } from "svelte";
	import { emit, listen } from "@tauri-apps/api/event";
	import { confirm } from "@tauri-apps/api/dialog";
	import { invoke } from "@tauri-apps/api/tauri";
	import { exit } from "@tauri-apps/api/process";

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
		contextMenu,
		splash,
	} from "./stores";
	import {
		fileNameFromPath,
		createPlaylistTrack,
		waveformCalc,
		updateProjectorList,
		setUIScale,
	} from "./utils";
	import {
		savePlaylist,
		openDir,
		loadSettings,
		checkSettingsExist,
	} from "./saveLoad";
	import ContextMenu from "./pureUI/components/ContextMenu.svelte";
	import PropNumber from "./pureUI/components/props/PropNumber.svelte";

	let playlistEl: HTMLElement;
	let annotationWidth: number = 40;
	let showTracklist = true;
	let showAnnotations = true;
	let showEditor = false;
	let showCurrent = true;
	let showHotkeys = true;
	let projector = false;

	checkSettingsExist();

	const ctx = new AudioContext();
	const analyser = ctx.createAnalyser();
	const masterGain = ctx.createGain();
	masterGain.connect(analyser).connect(ctx.destination);

	function openVideoWindow(show: boolean) {
		invoke("show_projector", { invokeMessage: show ? "true" : "false" });
	}

	function openSettings() {
		invoke("open_settings", { invokeMessage: JSON.stringify($settings) });
	}

	function handleDropPlaylist(e) {
		e.preventDefault();
		if ($currentDragging.origin == "playlist") {
			console.log("drop form playlist", e);
			let oldPosition = $playlist.indexOf($currentDragging);
			playlist.update(e => {
				e.splice(oldPosition, 1);
				return e;
			});
			$playlist.push($currentDragging);
			$playlist = $playlist;
		} else if ($currentDragging.origin == "src") {
			console.log("drop form src", e);
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
		for (let i = $selectedItem - 1; i > -1; i--) {
			if ($playlist[i].type != "annotation") {
				$selectedItem = i;
				break;
			}
		}
	}

	function moveDown() {
		for (let i = $selectedItem + 1; i < $playlist.length; i++) {
			if ($playlist[i].type != "annotation") {
				$selectedItem = i;
				break;
			}
		}
	}

	function skip() {
		for (let i = $selectedItem + 1; i < $playlist.length; i++) {
			if ($playlist[i].type != "annotation") {
				$playlistElements[$selectedItem].stop(true);
				$selectedItem = i;
				$playlistElements[$selectedItem].play(0);
				break;
			}
		}
	}

	function deleteTrack() {
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
		playlist.update(e => {
			e.splice(toDelete, 1);
			return e;
		});
		$playlist = $playlist;
	}

	function pauseAll() {
		for (let i = 0; i < $playlistElements.length; i++) {
			$playlistElements[i].stop(false, false);
		}
	}

	function resetAll() {
		for (let i = 0; i < $playlistElements.length; i++) {
			$playlistElements[i].stop(true, false);
		}
	}

	const listenerMenus = listen("menu", async event => {
		console.log(event);
		if (event.payload == "quit" && $editMode) {
			const confirmed = await confirm("Discard all unsaved changes?", {
				title: "Quit?",
				type: "warning",
				okLabel: "Quit",
			}).then(isOK => (isOK ? exit(0) : null));
		} else if (event.payload == "open" && $editMode) {
			openDir();
		} else if (event.payload == "save") {
			savePlaylist();
		} else if (event.payload == "projector" && $settings.video) {
			openVideoWindow(!projector);
			projector = !projector;
		} else if (event.payload == "settings" && $editMode) {
			openSettings();
		} else if (event.payload == "showTracklist" && $editMode) {
			showTracklist = !showTracklist;
		} else if (event.payload == "showAnnotations") {
			showAnnotations = !showAnnotations;
		} else if (event.payload == "showCurrent") {
			showCurrent = !showCurrent;
		} else if (event.payload == "showHotkeys") {
			showHotkeys = !showHotkeys;
		} else if (event.payload == "showEditor" && $editMode) {
			showEditor = !showEditor;
		}
	});

	const listenerProjectorReq = listen("projctorReq", e => {
		updateProjectorList();
	});

	const listenerUpdateSettings = listen("reload_settings", () => {
		loadSettings();
		console.log("reloaded settings", $settings);
	});

	onMount(() => {
		//shortcuts
		document.addEventListener("keydown", e => {
			console.log(e);

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
					else if (e.code == "KeyP" && e.ctrlKey && $settings.video) {
						e.preventDefault();
						openVideoWindow(!projector);
						projector = !projector;
					}

					//delete playlist item
					else if (e.code == "Backspace" || e.code == "Delete") {
						e.preventDefault();
						deleteTrack();
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
					$playlistElements[$selectedItem].stop(true);
				}
				//skip song
				else if (
					(e.code === "KeyD" || e.code === "ArrowRight") &&
					!e.ctrlKey &&
					!e.metaKey
				) {
					e.preventDefault();
					skip();
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
			e.preventDefault();
		});

		const interval = setInterval(() => {
			for (let i = 0; i < $playlistElements.length; i++) {
				$playlistElements[i].update();
			}
		}, 300);

		return () => clearInterval(interval);
	});

	$: emit("editMode", { edit: $editMode });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if $splash}
	<Splash bind:splashScreen={$splash} />
{/if}

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<main class={"window-body dark " + $uiPlatform}>
	<!--SideBar-->
	{#if $editMode && showTracklist}
		<div class="tracklist">
			<div class="trackList">
				{#each $srcFiles as p, i}
					<TrackListItem entry={p} {ctx} {masterGain} />
				{/each}
				{#if $settings.video}
					<p class="category">videos</p>
					{#each $localFiles as l}
						<TrackListItem entry={l} {ctx} {masterGain} />
					{/each}
				{/if}
			</div>
		</div>
	{:else}
		<div />
	{/if}

	<!--TopBar-->
	<TopBar
		bind:showTracklist
		bind:showEditor
		bind:showCurrent
		bind:showHotkeys
		bind:showAnnotations
		{pauseAll}
		{resetAll}
	/>

	<!--playlist-->
	<div
		class="playlist"
		class:show-annotations={showAnnotations}
		class:editMode={$editMode}
		style={`--annotation-width: calc(${annotationWidth}% - ${
			$editMode ? 46 : 9
		}rem);`}
		on:drop={handleDropPlaylist}
		on:dragover={e => {
			e.preventDefault();
			return false;
		}}
		bind:this={playlistEl}
	>
		{#if showAnnotations}
			<input
				type="range"
				class="annotation-slider"
				min="20"
				max={80}
				step="0.2"
				bind:value={annotationWidth}
			/>
		{/if}
		{#if $playlist.length > 0}
			{#each $playlist as t, i}
				{#if t.type == "track"}
					<PlayListTrack
						bind:this={$playlistElements[i]}
						bind:track={t}
						id={i}
						{ctx}
						{masterGain}
						{showAnnotations}
					/>
				{:else if t.type == "video"}
					<PlayListVideo
						bind:this={$playlistElements[i]}
						bind:track={t}
						id={i}
					/>
				{:else if t.type == "annotation" && showAnnotations}
					<PlayListAnotation
						bind:this={$playlistElements[i]}
						bind:track={t}
						id={i}
					/>
				{/if}
			{/each}
		{:else}
			<p class="placeholder">Drag Track here</p>
		{/if}
	</div>

	<!--editor-->
	{#if showEditor && $editMode}
		<div class="editor">
			{#if $selectedItem != null && $selectedItem != undefined && $playlist[$selectedItem].type == "track"}
				<div class="prop-bar">
					<label>cut</label>
					<PropNumber
						bind:value={$playlist[$selectedItem].edit.in}
						min={0}
						max={$playlist[$selectedItem].length}
						step={1}
						unit="s"
						onFocus={() => {
							isEditing.update(e => e + 1);
							console.log($isEditing);
						}}
						onBlur={() => {
							isEditing.update(e => e - 1);
							console.log($isEditing);
						}}
					/>
				</div>

				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class="track"
					style={`
						background: linear-gradient(
							90deg,
							#111 0%,
							#111 calc(100% * ${$playlist[$selectedItem].edit.in / $playlist[$selectedItem].length}),
							#fff calc(100% * ${$playlist[$selectedItem].edit.in /$playlist[$selectedItem].length}),
							#fff 100%
						);`}
				>
					<Waveform
						data={waveformCalc(
							$playlistElements[$selectedItem].getBuffer(),
							window.innerWidth
						)}
						samples={window.innerWidth}
						resY={200}
					/>
					<input
						type="range"
						min="0"
						max={$playlist[$selectedItem].length}
						step="0.01"
						bind:value={$playlist[$selectedItem].edit.in}
					/>
				</div>
			{:else}
				<p class="placeholder">No track selected</p>
			{/if}
		</div>
	{/if}

	<!--palettes on the right-->
	{#if showCurrent || showHotkeys}
		<div class="palettes">
			<!--current playing-->
			{#if showCurrent}
				<div class="current">
					{#each $playlist as e, i}
						{#if e.playing != undefined && e.state != 0}
							<div class="song">
								<div
									class="state"
									class:playing={e.playing}
									style={`width: calc(100% * ${
										e.state != undefined ? e.state / e.length : 0
									});`}
								/>
								<button
									on:click={ev => {
										if (e.playing) {
											$playlistElements[i].stop(false, false);
										} else {
											$playlistElements[i].stop(true, false);
										}
									}}
								>
									{#if e.inFade != null}
										<img
											src="./icons/square/fade.svg"
											alt=""
											draggable="false"
											class="fade-state-icon"
										/>
									{:else if e.playing}
										<img
											src="./icons/square/stop.svg"
											alt=""
											draggable="false"
										/>
									{:else}
										<img
											src="./icons/square/reset.svg"
											alt=""
											draggable="false"
										/>
									{/if}
								</button>
								<p>{e.name}</p>
							</div>
						{/if}
					{/each}
					<p class="placeholder">No track playing</p>
				</div>
			{/if}

			<!--hotkeys-->
			{#if showHotkeys}
				<div class="hotkeys">
					{#each $hotkeys as a, i}
						<Hotkey
							bind:this={$hotkeyElements[i]}
							bind:track={a.track}
							key={a.key}
						/>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	{#if $contextMenu != null}
		<ContextMenu />
	{/if}

	<div class="window-rim" />
</main>
