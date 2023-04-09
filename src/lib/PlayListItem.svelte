<script lang="ts">
    import { onMount } from "svelte";


	interface playListItem {
		title?: string,
		path?: string,
		length?: string,
		selected?: boolean,
		playing?: boolean,
		state?: number,
		missing?: boolean,
		annotation?: Array<string>,
		text?: string,
	}

	export let editMode: boolean;
	export let track: playListItem;
	export let deselectAll = () => {};

	function getSimplePath() {
		let dirs = track.path.split('/');
		return dirs[dirs.length - 3];
	}

	onMount(() => {
		let ctx = new AudioContext();
		let audio;
	})

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="playlistItem"
	class:selected={track.selected}
	class:missing={track.missing}
	on:click={(e) => {
		if(e.shiftKey == false) { deselectAll() }
		track.selected = true;
	}}>

	<!--annotation before-->
	{#if track.annotation[0] != ""}
		<div class="annotationStart">
			<p contenteditable="true">{track.annotation[0]}</p>
		</div>
	{/if}

	<div class="inner">

		<div class="progress" style={"width: calc(100% * " + track.state + ");"}></div>

		<button class="playBtn">
			{#if track.playing == false}
				<img src="../pureUI/icons/tb_stop.svg" alt="">
			{:else}
				<img src="../pureUI/icons/tb_play.svg" alt="">
			{/if}
		</button>

		<span class="name" style="flex: 1;">
			<p class="title">{track.title}</p>
			<p class="location">{getSimplePath()}</p>
		</span>

		<p class="length">{track.length}</p>

		<span class="fade">
			<p>Fade in:</p>
			<input type="number" value="0" min="0" disabled={!editMode}/>
			<p>Fade out:</p>
			<input type="number" value="0" min="0" disabled={!editMode}/>
		</span>

		<div class="volume">
			<span>
				<p>-</p>
				<input type="range" value="100" min="0" max="100" disabled={!editMode}/>
				<p>+</p>
			</span>

			<span>
				<p>L</p>
				<input type="range" value="5" min="0" max="10" disabled={!editMode}/>
				<p>R</p>
			</span>
		</div>

	</div>

	<!--annotation after-->
	{#if track.annotation[1] != ""}
		<div class="annotationEnd">
			<p contenteditable="true">{track.annotation[1]}</p>
		</div>
	{/if}

</div>
