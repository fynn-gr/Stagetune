<script lang="ts">
	import '../src/pureUI/scss/index.scss'
	import './style/App.scss'
	import { onMount } from 'svelte';
	import { open } from '@tauri-apps/api/dialog';
	import { WebviewWindow } from '@tauri-apps/api/window'
	import { readDir } from '@tauri-apps/api/fs';
 
	import PlayListTrack from "./lib/PlayListTrack.svelte";
	import PlayListAnotation from './lib/PlayListAnotation.svelte';
	import PlayListVideo from './lib/PlayListVideo.svelte';
	import TrackListItem from "./lib/TrackListItem.svelte";
	import TopBar from "./lib/TopBar.svelte";
	
	import { editMode, currentDragging, uiPlatform, playlist, selectedItem } from './stores';
	import { isAudioFile, isVideoFile, isPlaylistFile } from './utils';

	let sideBar = true;
	let editorPanel = false;
	let palettes = false;
	let zoom = 1.2;

	let webview: any;
	let path: string;
	let srcPaths = [];
	let hotkeys = [
		{
			title: "A Day To Remember",
			path: "D:/Alte Schule/Messias/Messias Musik/A Day To Remember - Mr. Highway's Thinking About The End.mp3",
			length: "2:55",
			selected: true,
			annotation: ["wenn Hirten auf","wenn Hireten ab, Komet runter, licht auf Hitern wechseln und Bla bla bla warten bis etwas passiert was soll das hier"]
		},
		{
			title: "Glocke",
			path: "D:/Alte Schule/Messias/Messias Musik/A Day To Remember - Mr. Highway's Thinking About The End.mp3",
			length: "2:55",
			selected: true,
			annotation: ["wenn Hirten auf","wenn Hireten ab, Komet runter, licht auf Hitern wechseln und Bla bla bla warten bis etwas passiert was soll das hier"]
		},
	];

	$: document.documentElement.style.fontSize = `${zoom}px`;

	function openDir() {

		try {
			open({
				directory: true,
				multiple: false,
			})
			.then(
				async sel => {
					if (sel == null) {
						console.log("nothing selected")
					} else {
						path = sel as string;
						const entries = await readDir(path, { recursive: true });

						function processEntries(entries) {

							for (const entry of entries) {
								console.log(`Entry: ${entry.path}`);
								if (entry.children) {
									//subfolder
									processEntries(entry.children)
								} else if (isPlaylistFile(entry.name)) {
									//Playlist File
									console.log("load playlist File")
								} else if (isAudioFile(entry.name)) {
									//Audio File
									entry.type = "track"
									srcPaths.push(entry);
								} else if (isVideoFile(entry.name)) {
									//Video File
									entry.type = "video"
									srcPaths.push(entry);
								} else { }
							}
						}
						console.log(srcPaths)
						
						processEntries(entries)
						//sort alphabetically
						srcPaths.sort(function (a, b) {
							if (a.name < b.name) {
								return -1;
							}
							if (a.name > b.name) {
								return 1;
							}
							return 0;
						});
						srcPaths = srcPaths
					}
				}
			);
		} catch (err) {
			console.error(err)
		}
	}

	function openVideoWindow() {
		webview = new WebviewWindow('theUniqueLabel', {
			url: '/video.html',
			alwaysOnTop: true,
			decorations: false,
			focus: false,
		})
		webview.once('tauri://created', function () {
		// webview window successfully created
		})
		webview.once('tauri://error', function (e) {
		// an error occurred during webview window creation
		})
	}

	function handleDropPlaylist(e) {
		e.preventDefault();
		if ($currentDragging.path) {
			console.log("drop new track into Playlist: ", $currentDragging);
			$playlist.push({
				type: $currentDragging.type,
				path: $currentDragging.path,
				title: $currentDragging.name,
				annotation: [null, null]
			})
			playlist.set($playlist);
			$currentDragging = null;

		} else if (typeof($currentDragging) == "object") {

		} else {
			$currentDragging = null;
		}
	}

	function moveUp() {
		$selectedItem > 0 ? selectedItem.update(n => n-1) : selectedItem.set(0);
		//if (playlist[selectedItem].text != null) {
		//	moveUp();
		//}
	}

	function moveDown()  {
		$selectedItem < $playlist.length - 1 ? selectedItem.update(n => n+1) : selectedItem;
		//if (playlist[selectedItem].text != null) {
		//	moveDown();
		//}
	}

	onMount(() => {

		//shortcuts
		document.addEventListener('keydown', (e) => {
			console.log(e.code)

			if(e.repeat) return;

			if ($editMode) {
				//open
				if (e.code == "KeyO" && e.ctrlKey == true) {
					openDir();
				}

				// openVideoWindow
				else if (e.code == "KeyV" && e.ctrlKey) {
					if (webview) {
						webview == null;
					} else {
						openVideoWindow();
					}
				}

				//delete playlist item
				else if (e.code == "Backspace" || e.code == "Delete") {
					playlist.update(e => {
						e.splice($selectedItem, 1);
						return e;
					})
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
				playlist.update(items => {
					items[$selectedItem].playing = false;
					items[$selectedItem].state = 0;
					return items;
				})
			}
			//skip song
			else if (e.code === "KeyD" && e.ctrlKey == false) {
				playlist.update(items => {
					items[$selectedItem].playing = false;
					items[$selectedItem].state = 0;
					selectedItem.update(n => n+1);
					items[$selectedItem].state = 0;
					items[$selectedItem].playing = false;
					return items;
				});
			}
			//play
			else if (e.code === "Space") {
				playlist.update(items => {
					items[$selectedItem].playing = !$playlist[$selectedItem].playing;
					return items;
				})
				console.log("change playing")
			}
			//save File
			else if (e.code == "KeyS" && e.ctrlKey == true) {
				//save
			}
		})

		// load debug
		path = "D:/Alte Schule/Musik/Messias"
  	});
</script>

<main class={"window-body dark " + $uiPlatform}>


	<!--SideBar-->
	<div 
		class="side-bar"
		style={`width: ${sideBar && $editMode ? '300' : '0'}px;`}>

		<div class="trackList">
			{#each srcPaths as p}
				<TrackListItem entry={p}/>
			{/each}
		</div>

	</div>


	<!--TopBar-->
	<TopBar
		bind:sideBar={sideBar}
		bind:editor={editorPanel}
		bind:palettes={palettes}
		bind:zoom={zoom}
	/>


	<!--playlist-->
	<div
		class="playlist"
		on:drop={handleDropPlaylist}
		on:dragenter={() => {console.log("enter playlist")}}
		on:dragover={e => {e.preventDefault(); return false;}}
	>

		{#if $playlist.length > 0}
			{#each $playlist as t, i}
				{#if t.type == "track"}
					<PlayListTrack
						bind:track={t}
						id={i}
					/>
				{:else if t.type == "video"}
					<PlayListVideo
						bind:track={t}
						id={i}
					/>
				{:else if t.type == "annotation"}
					<PlayListAnotation
						bind:text={t.text}
						id={i}
					/>
				{/if}
			{/each}
		{:else}
			<p class="placeholder">Drag Song to the Playlist</p>
		{/if}

	</div>


	<!--editor-->
	<div
		class="editor"
		style={`height: ${editorPanel && $editMode ? '300' : '0' }px;`}
	>
		<img class="waveform" src="./waveform.png">
	</div>


	<!--palettes on the right-->
	{#if palettes}
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