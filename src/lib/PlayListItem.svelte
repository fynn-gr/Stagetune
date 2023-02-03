<script lang="ts">
  import type { S } from "@tauri-apps/api/event-2a9960e7";

	interface playListItem {
		title?: string,
		path?: string,
		length?: string,
		selected?: boolean,
		playing?: boolean,
		state?: number,
		missing?: boolean,
		comBefore?: string,
		comAfter?: string,
		text?: string,
	}

	export let track:playListItem;
</script>

<div class="playlistItem" class:selected={track.selected} class:missing={track.missing}>

	{#if track.comBefore != undefined}
		<div class="annotationStart">
			<p contenteditable="true">{track.comBefore}</p>
		</div>
	{/if}

	<div class="inner">

		<div class="progress" style={"width: calc(100% * " + track.state + ");"}></div>

		<button class="playBtn">
			<object data="../pureUI/icons/tb_play.svg" aria-label=""></object>
		</button>

		<span class="name" style="flex: 1;">
			<p class="title">{track.title}</p>
			<p class="location">{track.path}</p>
		</span>

		<p class="length">{track.length}</p>

		<span class="fade">
			<p>Fade in:</p>
			<input type="number" value="0" min="0" />
			<p>Fade out:</p>
			<input type="number" value="0" min="0" />
		</span>

		<div class="volume">
			<p class="label">V</p>
			<input type="range" value="100" min="0" max="1"/>
		</div>
	</div>

	{#if track.comAfter != undefined}
		<div class="annotationEnd">
			<p contenteditable="true">{track.comAfter}</p>
		</div>
	{/if}

</div>
