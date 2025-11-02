<script lang="ts">
// Styles
import "../src/pureUI/scss/index.scss";
import "./style/App.scss";

// Svelte, Tauri
import { onMount } from "svelte";
import { emit, listen } from "@tauri-apps/api/event";
import { confirm, save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { exit } from "@tauri-apps/plugin-process";

// Components
import PlayListTrack from "./lib/PlayListTrack.svelte";
import PlayListAnotation from "./lib/PlayListAnnotation.svelte";
import PlayListVideo from "./lib/PlayListVideo.svelte";
import TrackListItem from "./lib/TrackListItem.svelte";
import TopBar from "./lib/TopBar.svelte";
import Hotkey from "./lib/Hotkey.svelte";
import Splash from "./lib/Splash.svelte";
import ContextMenu from "./pureUI/components/ContextMenu.svelte";
import PlayListImage from "./lib/PlayListImage.svelte";
import PlayListLoop from "./lib/PlayListLoop.svelte";
import Editor from "./lib/Editor.svelte"

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
	currentDragging,
	contextMenu,
	recent,
	projector,
} from "./ts/Stores.svelte";
import { updateProjectorList, DropHandler } from "./ts/Utils";
import {
	savePlaylist,
	openDir,
	loadSettings,
	checkSettingsExist,
	openPlaylist,
	relinkDir,
	saveSettings,
} from "./ts/SaveLoad";
import { createNativeMenu } from "./ts/Menus.svelte";
import { lastFolderFromPath } from "./ts/FileUtils";
import TracklistBuildIn from "./lib/TracklistBuildIn.svelte";
import type {
	PlaylistTrack,
	PlaylistVideo,
	PlaylistAnnotation,
	PlaylistImage,
	PlaylistLoop,
} from "./ts/Types";

// States
let playlistEl: HTMLElement;
let annotationWidth: number = $state(25);
let showTracklist = $state(true);
let showEditor = $state(false);
let showCurrent = $state(true);
let showHotkeys = $state(true);
let dragOverPlaylist = $state(false);

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
	console.log("add to playlist: ", $currentDragging);
	e.preventDefault();
	DropHandler(playlist.length);
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
			if (playlist[i].type != "annotation") {
				$selectedItem = i;
				break;
			}
		}
	}
}

function moveDown() {
	if (selectedItem) {
		for (let i = $selectedItem! + 1; i < playlist.length; i++) {
			if (playlist[i].type != "annotation") {
				$selectedItem = i;
				break;
			}
		}
	}
}

function skip() {
	if (selectedItem) {
		for (let i = $selectedItem! + 1; i < playlist.length; i++) {
			if (playlist[i].type != "annotation") {
				playlistElements[$selectedItem!].stop(true);
				$selectedItem = i;
				playlistElements[$selectedItem].play(0);
				break;
			}
		}
	}
}

function deleteTrack() {
	if ($selectedItem) {
		const selected = playlist[$selectedItem];

		// Stop track if playing
		if (
			(selected.type === "track" || selected.type === "video") &&
			selected.playing
		) {
			playlistElements[$selectedItem].stop();
		}

		let toDelete = $selectedItem;

		// Remove hotkey if present
		if (selected.type === "track" && typeof selected.hotkey === "number") {
			let hotkeyRm = selected.hotkey;
			hotkeys[(hotkeyRm as number) - 1].track = null;
		}

		// Find new selected item
		if (playlist.length - 1 > $selectedItem) $selectedItem++;
		else if ($selectedItem > 0) $selectedItem--;
		else $selectedItem = undefined;

		// Delete from playlist
		playlist.splice(toDelete, 1);
	}
}

function pauseAll() {
	for (let element of playlistElements) {
		element.stop(false, false);
	}
}

function resetAll() {
	for (let element of playlistElements) {
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
		} else if (id == "clearRecent") {
			$recent = [];
			saveSettings();
			createNativeMenu();
		} else if (id == "save") {
			savePlaylist();
		} else if (id == "saveAs") {
			savePlaylist(true);
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
		emit("projector_set_location", {
			screen: projector.screens[projector.selectedScreen],
		});
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
				if ($selectedItem) playlistElements[$selectedItem].stop(true);
				break;
			case "KeyD":
			case "ArrowRight":
				skip();
				break;
			case "Space":
				if ($selectedItem) playlistElements[$selectedItem].playPause();
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
		for (let element of playlistElements) {
			element.update();
		}
	}, 300);

	return () => clearInterval(updateInterval);
});

$effect(() => {
	emit("editMode", { edit: $editMode });
});
$effect(() => {
	invoke("show_projector", {
		show: $showProjector,
	});
});
</script>

{#if $splash}
	<Splash bind:splashScreen={$splash} />
{/if}

<!-- svelte-ignore a11y_label_has_associated_control -->
<main class={"window-body dark " + $uiPlatform}>
	<!--SideBar-->
	{#if $editMode && showTracklist}
		<div class="tracklist">
			<!--Build in-->
			<TracklistBuildIn name="Annotation" />
			{#if $settings.debug}
				<TracklistBuildIn name="Loop" />
			{/if}

			<!--Source Folders-->
			{#each $srcFiles as p, i}
				<p
					class="folder-name"
					title={p.path}
					oncontextmenu={e => {
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
				class="add"
				onclick={() => {
					openDir();
				}}
			>
				<img src="/icons/topbar/plus.svg" alt="" />
				<p>Source</p>
			</button>
		</div>
	{:else}
		<div></div>
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
		ondrop={handleDropPlaylist}
		ondragover={handleDragOverPlaylist}
		ondragleave={e => {
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
		{#each playlist as t, i}
			{#if t.type === "track"}
				<PlayListTrack
					bind:this={playlistElements[i]}
					bind:track={playlist[i] as PlaylistTrack}
					id={i}
					{ctx}
					{masterGain}
				/>
			{:else if t.type === "video"}
				<PlayListVideo
					bind:this={playlistElements[i]}
					bind:track={playlist[i] as PlaylistVideo}
					id={i}
				/>
			{:else if t.type === "image"}
				<PlayListImage
					bind:this={playlistElements[i]}
					bind:track={playlist[i] as PlaylistImage}
					id={i}
				/>
			{:else if t.type === "annotation"}
				<PlayListAnotation
					bind:this={playlistElements[i]}
					bind:track={playlist[i] as PlaylistAnnotation}
					id={i}
				/>
			{:else if t.type === "loop"}
				<PlayListLoop
					bind:this={playlistElements[i]}
					bind:track={playlist[i] as PlaylistLoop}
					id={i}
				/>
			{/if}
		{/each}
		{#if dragOverPlaylist}
			<div class="drag-end"></div>
		{/if}
		<p class="placeholder">Drag Track here</p>
	</div>

	<!--editor-->
	{#if showEditor && $editMode}
		<Editor />
	{/if}

	<!--palettes on the right-->
	{#if showCurrent || showHotkeys}
		<div class="palettes">
			<!--current playing-->
			{#if showCurrent}
				<div class="current">
					{#each playlist as e, i}
						{#if e.type != "annotation" && e.playing && (e.timeCode ?? 0) != 0}
							<div class="song">
								<div
									class="state"
									class:playing={e.playing}
									style={`width: calc(100% * ${e.timeCode != undefined ? e.timeCode / (e.length ?? 1) : 0});`}
								></div>
								<button
									title="current playing"
									onclick={() => playlistElements[i].stop(!e.playing, false)}
								>
									{#if e.type === "track" && (e as PlaylistTrack).inFade != null}
										<img
											src="./icons/topbar/fade.svg"
											alt=""
											draggable="false"
											class="fade-state-icon"
										/>
									{:else if e.playing}
										<img
											src="./icons/topbar/stop.svg"
											alt=""
											draggable="false"
										/>
									{:else}
										<img
											src="./icons/topbar/reset.svg"
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
					{#each hotkeys as a, i}
						<Hotkey
							bind:this={hotkeyElements[i]}
							bind:track={hotkeys[i].track}
							key={a.key}
						/>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<ContextMenu />

	{#if $uiPlatform == "mac"}
		<div class="window-rim"></div>
	{/if}
</main>
