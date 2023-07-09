<script lang="ts">
	import "../src/pureUI/scss/index.scss";
	import "./style/App.scss";
	import { onMount } from "svelte";
	import { open, save } from "@tauri-apps/api/dialog";
	import { WebviewWindow } from "@tauri-apps/api/window";
	import { readDir, readTextFile, writeTextFile } from "@tauri-apps/api/fs";

	import PlayListTrack from "./lib/PlayListTrack.svelte";
	import PlayListAnotation from "./lib/PlayListAnotation.svelte";
	import PlayListVideo from "./lib/PlayListVideo.svelte";
	import TrackListItem from "./lib/TrackListItem.svelte";
	import TopBar from "./lib/TopBar.svelte";

	import { pureLocale } from "./pureUI/modules/pureLocale";
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
		locale
	} from "./stores";
	import {
		isAudioFile,
		isVideoFile,
		isPlaylistFile,
		openPlaylist,
		saveDir,
		fileNameFromPath,
	} from "./utils";
	import { invoke } from "@tauri-apps/api/tauri";

	let sideBar = true;
	let editorPanel = false;
	let palettes = false;
	let zoom = 1.2;

	let projector = false;
	$: _ = $locale;

	$: document.documentElement.style.fontSize = `${zoom}px`;

	function openVideoWindow(show: boolean) {
		invoke("show_projector", {invokeMessage: show ? "true" : "false"})
	}

	function handleDropPlaylist(e) {
		e.preventDefault();
		if ($currentDragging.path) {
			console.log("drop new track into Playlist: ", $currentDragging);
			$playlist.push({
				type: $currentDragging.type,
				path: $currentDragging.path,
				title: $currentDragging.name,
				annotation: [null, null],
			});
			playlist.set($playlist);
			$currentDragging = null;
		} else if (typeof $currentDragging == "object") {
		} else {
			$currentDragging = null;
		}
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

	onMount(() => {
		//i18n
		new pureLocale("en");

		//shortcuts
		document.addEventListener("keydown", (e) => {
			if ($isEditing > 0) {
				return;
			} else {
				console.log(e.code);
				if ($editMode) {
					//open Playlist
					if (e.code == "KeyO" && e.ctrlKey == true) {
						openPlaylist();
					}

					// openVideoWindow
					else if (e.code == "KeyV" && e.ctrlKey) {
						openVideoWindow(!projector)
						projector = !projector;
					}

					//delete playlist item
					else if (e.code == "Backspace" || e.code == "Delete") {
						playlist.update((e) => {
							e.splice($selectedItem, 1);
							return e;
						});
						$playlist = $playlist;
					}
				}

				//move up
				if (e.code === "KeyW" && e.ctrlKey == false) {
					moveUp();
				}
				//move down
				else if (e.code === "KeyS" && e.ctrlKey == false) {
					moveDown();
				}
				//reset song
				else if (e.code === "KeyA" && e.ctrlKey == false) {
					playlist.update((items) => {
						items[$selectedItem].playing = false;
						items[$selectedItem].state = 0;
						return items;
					});
				}
				//skip song
				else if (e.code === "KeyD" && e.ctrlKey == false) {
					playlist.update((items) => {
						items[$selectedItem].playing = false;
						items[$selectedItem].state = 0;
						selectedItem.update((n) => n + 1);
						items[$selectedItem].state = 0;
						items[$selectedItem].playing = true;
						return items;
					});
				}
				//play
				else if (e.code === "Space") {
					playlist.update((items) => {
						items[$selectedItem].playing = !$playlist[$selectedItem].playing;
						return items;
					});
					console.log("change playing");
				}
				//save File
				else if (e.code == "KeyS" && e.ctrlKey == true) {
					saveDir();
				}
			}
		});
	});
</script>

<main class={"window-body dark " + $uiPlatform}>
	<!--SideBar-->
	<div
		class="side-bar"
		style={`width: ${sideBar && $editMode ? "300" : "0"}px;`}
	>
		<div class="trackList">
			{#each $srcFiles as p, i}
				<p class="category">
					{fileNameFromPath($srcPaths[i])}
				</p>

				{#each p as e}
					<TrackListItem entry={e} />
				{/each}
			{/each}
		</div>
	</div>

	<!--TopBar-->
	<TopBar bind:sideBar bind:editor={editorPanel} bind:palettes bind:zoom />

	<!--playlist-->
	<div
		class="playlist"
		on:drop={handleDropPlaylist}
		on:dragenter={() => {
			console.log("enter playlist");
		}}
		on:dragover={(e) => {
			e.preventDefault();
			return false;
		}}
	>
		{#if $playlist.length > 0}
			{#each $playlist as t, i}
				{#if t.type == "track"}
					<PlayListTrack bind:track={t} id={i} />
				{:else if t.type == "video"}
					<PlayListVideo
						bind:track={t}
						id={i}
					/>
				{:else if t.type == "annotation"}
					<PlayListAnotation bind:item={t} id={i} />
				{/if}
			{/each}
		{:else}
			<p class="placeholder">Drag Track here</p>
		{/if}
	</div>

	<!--editor-->
	<div
		class="editor"
		style={`height: ${editorPanel && $editMode ? "300" : "0"}px;`}
	>
		<img class="waveform" src="./waveform.png" />
	</div>

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
							<p>{e.title}</p>
						</div>
					{/if}
				{/each}
			</div>

			<!--hotkeys-->
			<div class="hotkeys">
				{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as a, i}
					<div class="hotkeySlot">
						<p class="key">{a}</p>
						{#if hotkeys[i]}
							<p class="name">{hotkeys[i].title}</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div class="window-rim" />
</main>
