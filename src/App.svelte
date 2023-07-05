<script lang="ts">
	import '../src/pureUI/scss/index.scss'
	import './style/App.scss'
	import { onMount } from 'svelte';
	import { open } from '@tauri-apps/api/dialog';
	import { WebviewWindow } from '@tauri-apps/api/window'
	import { readDir } from '@tauri-apps/api/fs';
 
	import PlayListItem from "./lib/PlayListItem.svelte";
	import PlayListAnotation from './lib/PlayListAnotation.svelte';
	import TrackListItem from "./lib/TrackListItem.svelte";
	import TopBar from "./lib/TopBar.svelte";
	
	import { editMode, currentDragging, uiPlatform } from './stores';
	import { isAudioFile } from './utils';

	let sideBar = true;
	let editorPanel = false;
	let palettes = false;
	let zoom = 1.2;

	let webview: any;
	let path: string;
	let srcPaths =  [
		{name: "test.test", path: "testPath"}
	];
	let playlist: Array<any> = [
		//text

		//playing
		//path
		//title
		//length
		//state
		//volume
		//pan
		//repeat
		//edit [cutIn, cutOut, fadeIn, fadeOut]
		//annotation [before, after]

		//title
		//tracks

		{
			type: "track",
			path: "D:/Alte Schule/Messias/Messias Musik/Der Messias 42. Chor  Halleluja.mp3",
			length: "2:30",
			annotation: [null, null]
		},
		{
			type: "track",
			title: "A Day To Remember",
			path: "D:/Alte Schule/Messias/Messias Musik/A Day To Remember - Mr. Highway's Thinking About The End.mp3",
			length: "2:55",
			annotation: ["wenn Hirten auf","wenn Hireten ab, Komet runter, licht auf Hitern wechseln und Bla bla bla warten bis etwas passiert was soll das hier"]
		},
		{
			type: "track",
			path: "D:/Alte Schule/Messias/Messias Musik/A Day To Remember - Mr. Highway's Thinking About The End.mp3",
			length: "3:10",
			annotation: ["wenn Hirten auf", null]
		},
		{
			type: "annotation",
			text: "Pause - Bühne umbauen, dann nach oben gehen, nicht vergessen auf die Uhr zu schauen und dann mit einer Cola aufs Sofa setzen"
		},
		{
			type: "track",
			title: "Kein schöner Land",
			path: "",
			length: "10:56",
			state: 0.4,
			annotation: [null, null]
		},
		/*
		{
			title: "Einlass",
			tracks: [
				{
					title: "A Day To Remember",
					path: "D:/Alte Schule/Messias/Messias Musik/A Day To Remember - Mr. Highway's Thinking About The End.mp3",
					length: "2:55",
					annotation: ["wenn Hirten auf","wenn Hireten ab, Komet runter, licht auf Hitern wechseln und Bla bla bla warten bis etwas passiert was soll das hier"]
				},
				{
					path: "D:/Alte Schule/Messias/Messias Musik/Der Messias 42. Chor  Halleluja.mp3",
					length: "2:30",
					annotation: ["", ""]
				},
				{
					path: "D:/Alte Schule/Messias/Messias Musik/A Day To Remember - Mr. Highway's Thinking About The End.mp3",
					length: "3:10",
					annotation: ["wenn Hirten auf", ""]
				}
			]
		}*/
	];
	let selectedItem = null;
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
									processEntries(entry.children)
								} else {
									srcPaths.push(entry);
								}
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
		console.log("handle drop on Playlist")
		if ($currentDragging.path) {
			console.log("drop new track into Playlist: ", $currentDragging);
			playlist.push({
				type: "track",
				path: $currentDragging.path,
				title: $currentDragging.name,
				annotation: [null, null]
			})
			playlist = playlist;
			$currentDragging = null;

		} else if (typeof($currentDragging) == "object") {

		} else {
			$currentDragging = null;
		}
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
					playlist.splice(selectedItem, 1)
					playlist = playlist
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
			else if (e.code === "Space") {
				//play
				playlist[selectedItem].playing = !playlist[selectedItem].playing
				console.log("change playing")
			}
			//save File
			else if (e.code == "KeyS" && e.ctrlKey == true) {
				//save
			}
		})

		function moveUp() {
			selectedItem > 0 ? selectedItem-- : selectedItem = 0;
			//if (playlist[selectedItem].text != null) {
			//	moveUp();
			//}
		}

		function moveDown()  {
			selectedItem < playlist.length - 1? selectedItem++ : selectedItem;
			//if (playlist[selectedItem].text != null) {
			//	moveDown();
			//}
		}

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
				<TrackListItem path={p.path} fileName={p.name}/>
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

		{#each playlist as t, i}
			{#if t.type == "track"}
				<PlayListItem
					bind:track={t}
					bind:selectedItem={selectedItem}
					id={i}
				/>
			{:else if t.type == "annotation"}
				<PlayListAnotation
					bind:selectedItem={selectedItem}
					bind:text={t.text}
					id={i}
				/>
			{/if}
		{/each}

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