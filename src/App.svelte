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
		hotkeys
	} from "./stores";
	import {
		openPlaylist,
		savePlaylist,
		fileNameFromPath,
		openDir,
		createPlaylistTrack
	} from "./utils";
	import type { playListItem } from "@/utils";
	import PlayListLoop from "./lib/PlayListLoop.svelte";

	const ctx = new AudioContext();
	let playlistElement: HTMLElement;

	let playlistElements = [];
	let hotkeyElements = [];
	let sideBar = true;
	let editorPanel = false;
	let projector = false;
	let palettes = true;
	let zoom = 1.2;

	$: document.documentElement.style.fontSize = `${zoom}px`;

	function openVideoWindow(show: boolean) {
		invoke("show_projector", {invokeMessage: show ? "true" : "false"})
	}

	function handleDropPlaylist(e) {
		e.preventDefault();
		if ($currentDragging.origin == "src") {
			$playlist.push(createPlaylistTrack(
					"playlist",
					$currentDragging.type,
					$currentDragging.path,
					$currentDragging.name,
				));
			playlist.set($playlist);
			$currentDragging = null;
		} else if ($currentDragging.origin == "playlist") {
			let oldPosition = $playlist.indexOf($currentDragging);
			playlist.update(e => {
				e.splice(oldPosition, 1);
				return e;
			});
			$playlist.push($currentDragging);
			$playlist = $playlist;

			$currentDragging= null;

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
						if ($playlist[$selectedItem].playing) playlistElements[$selectedItem].stop();
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
				else if ((e.code === "KeyA" || e.code === "ArrowLeft") && !e.ctrlKey && !e.metaKey) {
					playlist.update((items) => {
						playlistElements[$selectedItem].stop(true);
						return items;
					});
				}
				//skip song
				else if ((e.code === "KeyD" || e.code === "ArrowRight") && !e.ctrlKey && !e.metaKey) {
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
					<input type="number" bind:value={$playlist[$selectedItem].edit.in}>
					<label>fade in</label>
					<input type="number" bind:value={$playlist[$selectedItem].fade.in}>
					<label>fade in</label>
					<input type="number" bind:value={$playlist[$selectedItem].fade.out}>
				</div>
			
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div
					class="track"
					on:click={e => {
						let rec = e.target.getBoundingClientRect();
						let x = e.clientX - rec.left;
						let perc = Math.min(Math.max(x / rec.width, 0), 1);
						$playlist[$selectedItem].edit.in = perc * $playlist[$selectedItem].length
					}}
				>
					<Waveform
						buffer={playlistElements[$selectedItem].getBuffer()}
						samples={window.innerWidth}
						resY={200}
					/>
					<div
						class="resizer"
						style={`width: ${($playlist[$selectedItem].edit.in / $playlist[$selectedItem].length) * 100 }%;`}
					></div>
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
						<Hotkey bind:track={a} bind:this={hotkeyElements[i]} {ctx} stopAll={stopAll}/>
					{:else}
						<HotkeyPlaceholder bind:track={a} bind:this={hotkeyElements[i]}/>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	<div class="window-rim" />
</main>
