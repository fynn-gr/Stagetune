<script lang="ts">
    import { onMount } from "svelte";
    import PlayListItem from "./PlayListTrack.svelte";

	interface playListItem {
		text?: string,
		
		selected?: boolean,
		playing?: boolean,
		path?: string,
		title?: string,
		length?: string,
		state?: number,
		volume?: number,
		pan?: number,
		repeat?: boolean,
		edit?: Array<number>,
		annotation?: Array<string>,

		tracks?: Array<playListItem>,
	}

	export let editMode: boolean;
	export let track: playListItem;
	export let deselectAll = () => {};

	onMount(() => {

	})

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="playlistLoop"
	class:selected={track.selected}
	class:editMode={editMode}
	on:click={(e) => {
		if(e.shiftKey == false) { deselectAll() }
		track.selected = true;
	}}>

	<button class="playBtn">
		<img src="../pureUI/icons/square/play.svg" alt="play">
	</button>

	<button class="shuffleBtn">
		<img src="../pureUI/icons/square/shuffle.svg" alt="shuffle">
	</button>

	<p class="name">{track.title}</p>

	<div class="container">
		{#each track.tracks as t}
			<PlayListItem
				track={t}
				editMode={editMode}
			/>
		{/each}
	</div>


</div>
