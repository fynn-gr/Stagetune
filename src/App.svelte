<script lang="ts">
// Styles
import "../src/pureUI/scss/index.scss";
import "./style/App.scss";

// Svelte, Tauri
import { onMount } from "svelte";
import { emit, listen } from "@tauri-apps/api/event";
import { confirm } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { exit } from "@tauri-apps/plugin-process";

// Components
import PlayListTrack from "./lib/PlayListTrack.svelte";
import PlayListAnotation from "./lib/PlayListAnotation.svelte";
import PlayListVideo from "./lib/PlayListVideo.svelte";
import TrackListItem from "./lib/TrackListItem.svelte";
import TopBar from "./lib/TopBar.svelte";
import Hotkey from "./lib/Hotkey.svelte";
import Waveform from "./lib/Waveform.svelte";
import Splash from "./lib/Splash.svelte";
import ContextMenu from "./pureUI/components/ContextMenu.svelte";
import PropNumber from "./pureUI/components/props/PropNumber.svelte";

// Stores, Utils
import {
	editMode,
	uiPlatform,
	playlist,
	selectedItem,
	srcFiles,
	playlistElements,
	hotkeyElements,
	isEditing,
	hotkeys,
	settings,
	splash,
	showProjector,
	screens,
	selectedScreen,
	currentDragging,
	contextMenu,
} from "./ts/Stores";
import { waveformCalc, updateProjectorList, DropHandler } from "./ts/Utils";
import {
	savePlaylist,
	openDir,
	loadSettings,
	checkSettingsExist,
	openPlaylist,
	relinkDir,
} from "./ts/SaveLoad";
import { createNativeMenu } from "./ts/Menus";
import { lastFolderFromPath } from "./ts/FileUtils";
import PlayListImage from "./lib/PlayListImage.svelte";
import PlayListLoop from "./lib/PlayListLoop.svelte";

let playlistEl: HTMLElement;
let annotationWidth: number = 25;
let showTracklist = true;
let showEditor = false;
let showCurrent = true;
let showHotkeys = true;
let dragOverPlaylist = false;

checkSettingsExist();

// Audio context setup
const ctx = new AudioContext();
const analyser = ctx.createAnalyser();
const masterGain = ctx.createGain();
masterGain.connect(analyser).connect(ctx.destination);

function openSettings() {
	invoke("open_settings", { invokeMessage: JSON.stringify($settings) });
}

function handleDropPlaylist(e: Event) {
	console.log("to playlist", $currentDragging);
	e.preventDefault();
	DropHandler($playlist.length);
	dragOverPlaylist = false;
}

function handleDragOverPlaylist(e: DragEvent) {
	const target = e.target as HTMLElement;
	e.preventDefault();
	if (target.classList.contains("playlist")) {
		console.log("dragover Playlist");
		dragOverPlaylist = true;
	}
}

function moveUp() {
	if (selectedItem) {
		for (let i = $selectedItem! - 1; i > -1; i--) {
			if ($playlist[i].type != "annotation") {
				$selectedItem = i;
				break;
			}
		}
	}
}

function moveDown() {
	if (selectedItem) {
		for (let i = $selectedItem! + 1; i < $playlist.length; i++) {
			if ($playlist[i].type != "annotation") {
				$selectedItem = i;
				break;
			}
		}
	}
}

function skip() {
	if (selectedItem) {
		for (let i = $selectedItem! + 1; i < $playlist.length; i++) {
			if ($playlist[i].type != "annotation") {
				$playlistElements[$selectedItem!].stop(true);
				$selectedItem = i;
				$playlistElements[$selectedItem].play(0);
				break;
			}
		}
	}
}

function deleteTrack() {
	if ($selectedItem != null) {
		// Stop track if playing
		if ($playlist[$selectedItem].playing)
			$playlistElements[$selectedItem].stop();

		let toDelete = $selectedItem;

		// Remove hotkey if present
		if (typeof $playlist[$selectedItem].hotkey === "number") {
			let hotkeyRm = $playlist[$selectedItem].hotkey;
			$hotkeys[(hotkeyRm as number) - 1].track = null;
		}

		// Find new selected item
		if ($playlist.length - 1 > $selectedItem) $selectedItem++;
		else if ($selectedItem > 0) $selectedItem--;
		else $selectedItem = undefined;

		// Delete from playlist
		playlist.update(e => {
			e.splice(toDelete, 1);
			return e;
		});
		$playlist = $playlist;
	}
}

function pauseAll() {
	for (let element of $playlistElements) {
		element.stop(false, false);
	}
}

function resetAll() {
	for (let element of $playlistElements) {
		element.stop(true, false);
	}
}

// Event listeners
const Listeners = () => {
	listen("menu", async event => {
		let id = event.payload;
		console.log(event);

		if (id == "quit" && $editMode) {
			const confirmed = await confirm("Discard all unsaved changes?", {
				title: "Quit?",
				kind: "warning",
				okLabel: "Quit",
			}).then(isOK => (isOK ? exit(0) : null));
		} else if (id == "newPlaylist") {
			// TODO
		} else if (id == "openPlaylist" && $editMode) {
			openPlaylist();
		} else if (id == "savePlaylist") {
			savePlaylist();
		} else if (id == "addSource") {
			openDir();
		} else if (id == "projector") {
			$showProjector = !$showProjector;
		} else if (id == "settings" && $editMode) {
			openSettings();
		} else if (id == "showTracklist" && $editMode) {
			showTracklist = !showTracklist;
		} else if (id == "showCurrent") {
			showCurrent = !showCurrent;
		} else if (id == "showHotkeys") {
			showHotkeys = !showHotkeys;
		} else if (id == "showEditor" && $editMode) {
			showEditor = !showEditor;
		} else if (id == "showSplash" && $editMode) {
			$splash = true;
		}
	});

	listen("projctorReq", e => {
		updateProjectorList();
		emit("projector_set_location", { screen: $screens[$selectedScreen] });
	});

	listen("reload_settings", () => {
		loadSettings();
		console.log("reloaded settings", $settings);
	});
};

// Shortcuts
const Shortcuts = () => {
	document.addEventListener("keydown", e => {
		if ($isEditing > 0) return;

		if ($editMode) {
			switch (e.code) {
				case "KeyO":
					if (e.ctrlKey) openDir();
					break;
				case "KeyP":
					if (e.ctrlKey) {
						e.preventDefault();
						$showProjector = !$showProjector;
					}
					break;
				case "Backspace":
				case "Delete":
					deleteTrack();
					break;
				case "Comma":
					if (e.ctrlKey) openSettings();
					break;
				case "KeyS":
					if (e.ctrlKey) savePlaylist();
					break;
			}
		}

		switch (e.code) {
			case "KeyW":
			case "ArrowUp":
				moveUp();
				break;
			case "KeyS":
			case "ArrowDown":
				moveDown();
				break;
			case "KeyA":
			case "ArrowLeft":
				if ($selectedItem) $playlistElements[$selectedItem].stop(true);
				break;
			case "KeyD":
			case "ArrowRight":
				skip();
				break;
			case "Space":
				if ($selectedItem) $playlistElements[$selectedItem].playPause();
				break;
		}
	});

	document.addEventListener("contextmenu", e => e.preventDefault());
};

// On mount lifecycle
onMount(() => {
	Listeners();
	Shortcuts();
	createNativeMenu();

	const updateInterval = setInterval(() => {
		for (let element of $playlistElements) {
			element.update();
		}
	}, 300);

	return () => clearInterval(updateInterval);
});

$: emit("editMode", { edit: $editMode });
$: invoke("show_projector", {
	show: $showProjector ? true : false,
});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<!-- svelte-ignore a11y-label-has-associated-control -->
{#if $splash}
	<Splash bind:splashScreen={$splash} />
{/if}

<main class={"window-body dark " + $uiPlatform}>
	<!--SideBar-->
	{#if $editMode && showTracklist}
		<div class="tracklist">
			<div class="trackList">
				{#each $srcFiles as p, i}
					<p
						class="category"
						title={p.path}
						on:contextmenu={e => {
							if ($editMode) {
								$contextMenu = {
									position: { x: e.clientX, y: e.clientY },
									content: [
										{
											name: "Relink",
											icon: "",
											iconColor: false,
											action: () => {
												relinkDir(i);
											},
										},
									],
								};
								console.log($contextMenu, e);
							}
						}}
					>
						{lastFolderFromPath(p.path)}
					</p>
					{#each p.files as e, j}
						<TrackListItem entry={e} {ctx} {masterGain} />
					{/each}
				{/each}
				<button
					class="placeholder"
					on:click={() => {
						openDir();
					}}>Add Source Directory</button
				>
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
		{pauseAll}
		{resetAll}
	/>

	<!--playlist-->
	<div
		class="playlist"
		class:show-annotations={$settings.showAnnotations}
		class:edit-mode={$editMode}
		style={`--annotation-width: calc(${annotationWidth}% - ${
			$editMode ? 46 : 9
		}rem);`}
		on:drop={handleDropPlaylist}
		on:dragover={handleDragOverPlaylist}
		on:dragleave={e => {
			console.log("drag leave Playlist");
			e.preventDefault();
			dragOverPlaylist = false;
		}}
		role="button"
		tabindex="0"
		bind:this={playlistEl}
	>
		{#if $settings.showAnnotations}
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
				{#if t.type === "track"}
					<PlayListTrack
						bind:this={$playlistElements[i]}
						bind:track={t}
						id={i}
						{ctx}
						{masterGain}
					/>
				{:else if t.type === "video"}
					<PlayListVideo
						bind:this={$playlistElements[i]}
						bind:track={t}
						id={i}
					/>
				{:else if t.type === "image"}
					<PlayListImage
						bind:this={$playlistElements[i]}
						bind:track={t}
						id={i}
					/>
				{:else if t.type === "annotation"}
					<PlayListAnotation
						bind:this={$playlistElements[i]}
						bind:track={t}
						id={i}
					/>
				{:else if t.type === "loop"}
					<PlayListLoop
						bind:this={$playlistElements[i]}
						bind:track={t}
						id={i}
					/>
				{/if}
			{/each}
			{#if dragOverPlaylist}
				<div class="drag-end" />
			{/if}
		{:else}
			<p class="placeholder">Drag Track here</p>
		{/if}
	</div>

	<!--editor-->
	{#if showEditor && $editMode}
		<div class="editor">
			{#if $selectedItem && $playlist[$selectedItem].buffer != null && $playlist[$selectedItem].type === "track"}
				<div class="prop-bar">
					<label>cut start</label>
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
						title="cut in"
					/>
				</div>

				<div class="track-wrapper">
					<div
						class="track"
						style={`
							background: linear-gradient(
								90deg,
								#111 0%,
								#111 calc(100% * ${
									$playlist[$selectedItem].edit.in /
									$playlist[$selectedItem].length
								}),
								#fff calc(100% * ${
									$playlist[$selectedItem].edit.in /
									$playlist[$selectedItem].length
								}),
								#fff 100%
							);`}
					>
						<Waveform
							data={waveformCalc(
								$playlistElements[$selectedItem].getBuffer(),
								window.innerWidth,
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
					<div
						class="border"
						style={`left: ${($playlist[$selectedItem].edit.in / $playlist[$selectedItem].length) * 100}%;`}
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
									style={`width: calc(100% * ${e.state != undefined ? e.state / e.length : 0});`}
								/>
								<button
									title="current playing"
									on:click={() => $playlistElements[i].stop(!e.playing, false)}
								>
									{#if e.inFade != null}
										<img
											src="./icons/top_bar/fade.svg"
											alt=""
											draggable="false"
											class="fade-state-icon"
										/>
									{:else if e.playing}
										<img
											src="./icons/top_bar/stop.svg"
											alt=""
											draggable="false"
										/>
									{:else}
										<img
											src="./icons/top_bar/reset.svg"
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

	<ContextMenu />

	<div class="window-rim" />
</main>
