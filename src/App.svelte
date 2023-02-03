<script>
	import '../pureUI/scss/index.scss'
	import './style/App.scss'
	import { onMount } from 'svelte';

	import PlayListItem from "./lib/PlayListItem.svelte";
	import PlaylistAnotation from "./lib/PlayListAnotation.svelte";
	import TrackListItem from "./lib/TrackListItem.svelte";
	import PlayBar from "./lib/PlayBar.svelte";
	import TopBar from "./lib/TopBar.svelte";
	import PlayListAnotation from './lib/PlayListAnotation.svelte';

	//platforms mac, win
	let uiPlatform = "mac";
	let editMode = true;

	let tracks = [
		{
			title: "Einlass Musik",
			path: "Local > Messias",
			length: "2:30",
			selected: false,
		},
		{
			title: "Hirten",
			path: "Local > Messias",
			length: "2:55",
			selected: true,
			comBefore: "wenn Hirten auf",
			comAfter: "wenn Hireten ab, Komet runter, licht auf Hitern wechseln und Bla bla bla warten bis etwas passiert was soll das hier"
		},
		{
			title: "Biene Maja",
			path: "Local > for fun",
			length: "3:10",
			selected: false,
			comBefore: "wenn Hirten auf"
		},
		{
			selected: false,
			text: "Pause - Bühne umbauen, dann nach oben gehen, nicht vergessen auf die Uhr zu schauen und dann mit einer Cola aufs Sofa setzen"
		},
		{
			title: "Kein schöner Land",
			path: "Local > Messias",
			length: "10:56",
			selected: false,
			state: 0.4
		}
	]

  onMount(() => {
    document.body.classList.add(uiPlatform);
    document.body.classList.add("dark");
  });
</script>

<main class="windowBody">
	<div class="viewNavSplit">

		<div class="sideBar">
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

		<div class="viewSplitVertical">

			<TopBar {uiPlatform}/>

			<div class="playList">
				{#each tracks as t, i}
					{#if t.title != undefined}
						<PlayListItem
							bind:track={t} />
					{:else}
						<PlayListAnotation selected={t.selected} text={t.text}/>
					{/if}
				{/each}
			</div>

			<div class="properties">
				
			</div>

		</div>

	</div>
	
	<div class="windowRim" />

</main>