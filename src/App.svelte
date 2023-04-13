<script lang="ts">
	import '../pureUI/scss/index.scss'
	import './style/App.scss'
	import { onMount } from 'svelte';
	import { open } from '@tauri-apps/api/dialog';
 
	import PlayListItem from "./lib/PlayListItem.svelte";
	import PlayListAnotation from './lib/PlayListAnotation.svelte';
	import PlayListLoop from './lib/PlayListLoop.svelte';
	import TrackListItem from "./lib/TrackListItem.svelte";
	import TopBar from "./lib/TopBar.svelte";


	type Platform = "win" | "mac";
	let uiPlatform: Platform = "win";
	let editMode = true;
	let sideBar = false;
	let editorPanel = false;
	let palettes = true;
	let zoom = 1.2;

	let path: string;
	let srcPaths =  [
		"D:/Alte Schule/Messias/Messias Musik/A Day To Remember - Mr. Highway's Thinking About The End.mp3",
		"D:/Alte Schule/Messias/Messias Musik/Biene Maja Intro (German).mp3",
		"D:/Alte Schule/Messias/Messias Musik/Der Messias 1. Arioso. Tenor  Tröste dich, mein....mp3"
	];

	let playlist = [
		//selected
		//text

		//selected
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
			path: "D:/Alte Schule/Messias/Messias Musik/Der Messias 42. Chor  Halleluja.mp3",
			length: "2:30",
			selected: false,
			annotation: ["", ""]
		},
		{
			title: "A Day To Remember",
			path: "D:/Alte Schule/Messias/Messias Musik/A Day To Remember - Mr. Highway's Thinking About The End.mp3",
			length: "2:55",
			selected: true,
			annotation: ["wenn Hirten auf","wenn Hireten ab, Komet runter, licht auf Hitern wechseln und Bla bla bla warten bis etwas passiert was soll das hier"]
		},
		{
			path: "D:/Alte Schule/Messias/Messias Musik/A Day To Remember - Mr. Highway's Thinking About The End.mp3",
			length: "3:10",
			selected: false,
			annotation: ["wenn Hirten auf", ""]
		},
		{
			selected: false,
			text: "Pause - Bühne umbauen, dann nach oben gehen, nicht vergessen auf die Uhr zu schauen und dann mit einer Cola aufs Sofa setzen"
		},
		{
			title: "Kein schöner Land",
			path: "",
			length: "10:56",
			selected: false,
			state: 0.4,
			annotation: ["", ""]
		},
		/*
		{
			title: "Einlass",
			tracks: [
				{
					title: "A Day To Remember",
					path: "D:/Alte Schule/Messias/Messias Musik/A Day To Remember - Mr. Highway's Thinking About The End.mp3",
					length: "2:55",
					selected: true,
					annotation: ["wenn Hirten auf","wenn Hireten ab, Komet runter, licht auf Hitern wechseln und Bla bla bla warten bis etwas passiert was soll das hier"]
				},
				{
					path: "D:/Alte Schule/Messias/Messias Musik/Der Messias 42. Chor  Halleluja.mp3",
					length: "2:30",
					selected: false,
					annotation: ["", ""]
				},
				{
					path: "D:/Alte Schule/Messias/Messias Musik/A Day To Remember - Mr. Highway's Thinking About The End.mp3",
					length: "3:10",
					selected: false,
					annotation: ["wenn Hirten auf", ""]
				}
			]
		}*/
	];
	let playing = [

	];
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

	function deselectAll() {
		playlist.forEach(e => {
			e.selected = false;
		});
	}

	$: document.documentElement.style.fontSize = `${zoom}px`;

	onMount(() => {
		document.addEventListener('keypress', (e) => {
			console.log(e)

			if (!editMode) {
				//open
				if (e.code == "KeyO" && e.ctrlKey == true) {

					console.log("open Path")

					const selected = open({
						directory: true,
						multiple: false,
					})
					.then(
						sel => {
							if (sel == null) {
								console.log("nothing selected")
							} else {
								path = sel;
								console.log(sel)
							}
						}
					);
				}
				//up
				else if (e.code == "KeyW" && e.ctrlKey == false) {

					console.log("move up");

				}
				//move down
				else if (e.code == "KeyS" && e.ctrlKey == false) {

					console.log("move down");
				}
				//save File
				else if (e.code == "KeyS" && e.ctrlKey == true) {

					//save
				}
			}
		})
  });
</script>

<main class={"windowBody dark " + uiPlatform}>


	<!--SideBar-->
	<div 
		class="sideBar"
		style={`width: ${sideBar && editMode ? '300' : '0'}px;`}>

		<div class="trackList">
			{#each srcPaths as p}
				<TrackListItem path={p}/>
			{/each}
		</div>

	</div>


	<!--TopBar-->
	<TopBar
		{uiPlatform}
		bind:sideBar={sideBar}
		bind:editMode={editMode}
		bind:editor={editorPanel}
		bind:palettes={palettes}
		bind:zoom={zoom}
	/>


	<!--playlist-->
	<div class="playList" >

		{#each playlist as t}
			{#if t.path != undefined}
				<PlayListItem
					bind:track={t}
					bind:editMode={editMode}
					deselectAll={deselectAll}
				/>
			{:else if t.tracks != undefined}
				<PlayListLoop 
					bind:track={t}
					editMode={editMode}
					deselectAll={deselectAll}
				/>
			{:else}
				<PlayListAnotation
					bind:selected={t.selected}
					bind:text={t.text}
					{editMode}
					deselectAll={deselectAll}
				/>
			{/if}
		{/each}

	</div>


	<!--editor-->
	<div
		class="editor"
		style={`height: ${editorPanel && editMode ? '300' : '0' }px;`}
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

	<div class="windowRim" />

</main>