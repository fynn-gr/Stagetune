<script lang="ts">
	import "../src/pureUI/scss/index.scss";
	import "./style/App.scss";
	import { onMount } from "svelte";

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
		hotkeys
	} from "./stores";
	import {
		openPlaylist,
		savePlaylist,
		fileNameFromPath,
		openDir,
	} from "./utils";
	import { invoke } from "@tauri-apps/api/tauri";
	import Hotkey from "./lib/Hotkey.svelte";
	import HotkeyPlaceholder from "./lib/HotkeyPlaceholder.svelte";
	import Waveform from "./lib/Waveform.svelte";
	import { listen } from "@tauri-apps/api/event";
	import { appWindow } from "@tauri-apps/api/window";
	import { confirm } from "@tauri-apps/api/dialog";

	let trackElements = [];
	let hotkeyElements = [];
	let sideBar = true;
	let editorPanel = true;
	let palettes = true;
	let zoom = 1.2;
	let projector = false;

	$: document.documentElement.style.fontSize = `${zoom}px`;

	const ctx = new AudioContext();

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
				fade: [0, 0],
				edit: [0, 0],
			});
			playlist.set($playlist);
			$currentDragging = null;
		} else if (typeof $currentDragging == "object") {
		} else {
			$currentDragging = null;
		}
	}

	function stopAll(playlist: boolean, hotkeys: boolean) {
		if (hotkeys) {
			for (let i = 0; i < hotkeyElements.length; i++) {
				hotkeyElements[i].createInput(true)
			}
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

	const unlisten = listen("menu", async event => {
		console.log(event)
		if (event.payload == "quit") {
			if ($editMode) {
				const confirmed = await confirm('wanna save changes', {title: 'Tauri', type: 'warning'})
				.then(isOK => isOK ? appWindow.close() : null)
				
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
	})

	onMount(() => {

		//shortcuts
		document.addEventListener("keydown", (e) => {

			//console.log(e)

			if ($isEditing > 0) {
				return;
			} else {
				if ($editMode) {
					//open Playlist
					if (e.code == "KeyO" && ( e.ctrlKey )) {
						openPlaylist();
					}

					else if (e.code == "KeyA" && ( e.ctrlKey )) {
						openDir();
					}

					// openVideoWindow
					else if (e.code == "KeyP" && ( e.ctrlKey )) {
						openVideoWindow(!projector)
						projector = !projector;
					}

					//delete playlist item
					else if (e.code == "Backspace" || e.code == "Delete") {
						if ($playlist[$selectedItem].playing) trackElements[$selectedItem].stop();
						let toDelete = $selectedItem;
						if ($playlist.length - 1 > $selectedItem) $selectedItem++;
						else if ($selectedItem > 0) $selectedItem--;
						else $selectedItem = null;
						playlist.update(e => {
							e.splice(toDelete, 1);
							return e;
						});
						$playlist = $playlist;
					}
				}

				//move up
				if ((e.code === "KeyW" || e.code === "ArrowUp") && !e.ctrlKey && !e.metaKey) {
					moveUp();
				}
				//move down
				else if ((e.code === "KeyS" || e.code === "ArrowDown") && !e.ctrlKey && !e.metaKey) {
					moveDown();
				}
				//reset song
				else if ((e.code === "KeyA" || e.code === "ArrowLeft") && !e.ctrlKey && e.metaKey) {
					playlist.update((items) => {
						trackElements[$selectedItem].stop(true);
						return items;
					});
				}
				//skip song
				else if ((e.code === "KeyD" || e.code === "ArrowRight") && !e.ctrlKey && !e.metaKey) {
					playlist.update((items) => {
						trackElements[$selectedItem].stop(true);
						selectedItem.update((n) => n + 1);
						trackElements[$selectedItem].play(0);
						return items;
					});
				}
				//play
				else if (e.code === "Space") {
					trackElements[$selectedItem].playPause();
				}
				//save File
				else if (e.code == "KeyS" &&  ( e.ctrlKey )) {
					savePlaylist();
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
		on:dragover={(e) => {
			e.preventDefault();
			return false;
		}}
	>
		{#if $playlist.length > 0}
			{#each $playlist as t, i}
				{#if t.type == "track"}
					<PlayListTrack
						bind:this={trackElements[i]}
						bind:track={t}
						id={i}
						{ctx}
						/>
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
		style={`height: ${editorPanel && $editMode ? "200" : "0"}rem;`}
	>

		{#if $selectedItem != null && $selectedItem != undefined}
			<div class="prop-bar">
				<label>start</label>
				<input type="number" bind:value={$playlist[$selectedItem].edit[0]}>
				<label>fade in</label>
				<input type="number" bind:value={$playlist[$selectedItem].fade[0]}>
				<label>fade in</label>
				<input type="number" bind:value={$playlist[$selectedItem].fade[1]}>
			</div>
		
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div
				class="track"
				on:click={e => {

				}}
			>
				<Waveform
					buffer={trackElements[$selectedItem].getBuffer()}
					samples={1000}
					res={[1000, 200]}
				/>
				<div
					class="resizer"
					style={`width: ${($playlist[$selectedItem].edit[0] / $playlist[$selectedItem].length) * 100 }%;`}
				></div>
			</div>
		{:else}
			<p>No track selected</p>
		{/if}
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
			<div
				class="hotkeys"
			>
				{#each $hotkeys as a, i}
					{#if a.path != ""}
						<Hotkey bind:track={a} {ctx} bind:this={hotkeyElements[i]} stopAll={stopAll}/>
					{:else}
						<HotkeyPlaceholder bind:track={a} bind:this={hotkeyElements[i]}/>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	<div class="window-rim" />
</main>
