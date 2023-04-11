<script lang="ts">
    import { onMount } from "svelte";

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
	}

	let missing = false;
	export let editMode: boolean;
	export let track: playListItem;
	export let deselectAll = () => {};

	function getTitle() {

		if (track.title == undefined) {
			let split = track.path.split('/');
			let fileName = split[split.length -1]
			let title = fileName.substring(0, fileName.lastIndexOf('.'))
			return title;
		} else {
			return track.title;
		}
	}

	//TODO
	function getTimecode() {
		if (track.state == 0) {
			return "0:00";
		} else {
			//TODO
			return "10:20"
		}
	}

	onMount(() => {
		let ctx = new AudioContext();
		let audio;
	})

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="playlistItem"
	class:selected={track.selected}
	class:missing={missing}
	class:editMode={editMode}
	on:click={(e) => {
		if(e.shiftKey == false) { deselectAll() }
		track.selected = true;
	}}>

	<!--annotation before-->
	{#if track.annotation[0] != ""}
		<div class="annotationStart">
			<p contenteditable={editMode}>{track.annotation[0]}</p>
		</div>
	{/if}

	<div class="inner">

		<!--progress-->
		<img class="waveform" src="./waveform.png" alt="">
		<div class="progress" style={"width: calc(100% * " + track.state + ");"}></div>

		<!--play Button-->
		<button
			class="playBtn"
			class:active={track.playing}
			on:click={() => {
				track.playing = !track.playing;
			}}
		>
			{#if track.playing}
				<img src="../pureUI/icons/square/pause.svg" alt="">
			{:else}
				<img src="../pureUI/icons/square/play.svg" alt="">
			{/if}
		</button>

		<!--Info-->
		<p class="title">{getTitle()}</p>

		<!--repeat-->
		<button
			class="repeatBtn"
			class:active={track.repeat}
			on:click={() => {
				track.repeat = editMode ? !track.repeat : track.repeat
			}}
		>
			<img src="../pureUI/icons/square/repeat.svg" alt="repeat">
		</button>

		<!--time-->
		<p class="timecode">{getTimecode()}</p>
		<p class="length">{track.length}</p>


		<!--fade-->
		<span class="fade">
			<p>Fade in:</p>
			<input type="number" value="0" min="0" disabled={!editMode}/>
			<p>Fade out:</p>
			<input type="number" value="0" min="0" disabled={!editMode}/>
		</span>

		<!--volume-->
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
			<p contenteditable={editMode}>{track.annotation[1]}</p>
		</div>
	{/if}

</div>
