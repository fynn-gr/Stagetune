<script lang="ts">
	import '../pureUI/scss/index.scss'
	import './style/App.scss'
	import { onMount } from 'svelte';
	import { open } from '@tauri-apps/api/dialog';
 
	import PlayListItem from "./lib/PlayListItem.svelte";
	import TrackListItem from "./lib/TrackListItem.svelte";
	import TopBar from "./lib/TopBar.svelte";
	import PlayListAnotation from './lib/PlayListAnotation.svelte';

	//platforms mac, win
	let uiPlatform = "win";
	let editMode = false;
	let sideBar = true;
	let editor = true;

	let path: string;
	let playlist = [
		//selected
		//text

		//selected
		//title
		//path
		//length
		//annotation [before, after]
		//state
		//volume
		//edit [cutIn, cutOut, fadeIn, fadeOut]

		{
			title: "Einlass Musik",
			path: "D:/Alte Schule/Messias/Messias Musik/Der Messias 42. Chor  Halleluja.mp3",
			length: "2:30",
			selected: false,
			annotation: ["", ""]
		},
		{
			title: "Hirten",
			path: "",
			length: "2:55",
			selected: true,
			annotation: ["wenn Hirten auf","wenn Hireten ab, Komet runter, licht auf Hitern wechseln und Bla bla bla warten bis etwas passiert was soll das hier"]
		},
		{
			title: "Biene Maja",
			path: "",
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
		}
	]

	function deselectAll() {
		playlist.forEach(e => {
			e.selected = false;
		});
	}

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

<main
	class={"windowBody dark " + uiPlatform}>

	<div 
		class="sideBar"
		style={`width: ${sideBar && editMode ? '300' : '0'}px;`}>

		<div class="trackList">
			<p class="seperator">Messias</p>
			<TrackListItem />
			<TrackListItem />
			<TrackListItem />
			<p class="seperator">Alte Schule</p>
			<TrackListItem />
			<TrackListItem />
			<TrackListItem />
			<TrackListItem />
			<TrackListItem />
			<TrackListItem />
			<TrackListItem />
			<TrackListItem />
			<TrackListItem />
			<TrackListItem />
			<TrackListItem />
			<TrackListItem />
			<TrackListItem />
			<TrackListItem />
			<TrackListItem />
			<TrackListItem />
			<TrackListItem />
			<TrackListItem />
		</div>

	</div>


	<TopBar
		{uiPlatform}
		bind:sideBar={sideBar}
		bind:editMode={editMode}
		bind:editor={editor}/>


	<div class="playList" >

		{#each playlist as t}
			{#if t.title != undefined}
				<PlayListItem
					bind:track={t}
					bind:editMode={editMode}
					deselectAll={deselectAll} />
			{:else}
				<PlayListAnotation
					bind:selected={t.selected}
					bind:text={t.text}
					{editMode}
					deselectAll={deselectAll} />
			{/if}
		{/each}

	</div>

	<div
		class="editor"
		style={`height: ${editor && editMode ? '300' : '0' }px;`}>

	</div>

	<div class="windowRim" />

</main>