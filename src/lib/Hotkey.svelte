<script lang="ts">
import { addHotkey, rmHotkey } from "@/ts/Hotkeys";
import {
	hotkeys,
	currentDragging,
	draggingOrigin,
	isEditing,
	editMode,
	playlist,
	playlistElements,
	contextMenu,
} from "@/ts/Stores";
import { createPlaylistTrack } from "@/ts/Utils";
import { onMount } from "svelte";

export let key: number;
export let track: any = null;

onMount(async () => {
	document.addEventListener("keydown", e => {
		if ($isEditing > 0 || e.ctrlKey || e.code != `Digit${key}`) {
			return;
		} else if (!e.altKey && !track.playing) {
			//play
			e.preventDefault();
			let id = $playlist.indexOf(track);
			$playlistElements[id].play(null, true);
		} else if (!e.altKey && track.playing) {
			//stop
			e.preventDefault();
			let id = $playlist.indexOf(track);
			$playlistElements[id].stop(true, true);
		} else if (e.altKey && $editMode) {
			//deleting hotkey
			e.preventDefault();
			track.hotkey = undefined;
			track = null;

			$playlist = $playlist;
		}
	});
});
</script>

<div
	class="hotkeySlot"
	on:dragover={e => {
		e.preventDefault();
		return false;
	}}
	on:drop={e => {
		e.preventDefault();
		addHotkey(key);
	}}
	on:contextmenu={e => {
		if ($editMode) {
			$contextMenu = {
				position: { x: e.clientX, y: e.clientY },
				content: [
					{
						name: "Play",
						icon: "",
						iconColor: false,
						accelerator: `${key}`,
						action: () => {
							let id = $playlist.indexOf(track);
							$playlistElements[id].play(null, true);
						},
					},
					{
						name: "Delete Hotkey",
						icon: "./icons/menu_win/x.svg",
						iconColor: false,
						accelerator: `alt+${key}`,
						action: () => {
							rmHotkey(key);
						},
					},
				],
			};
			console.log($contextMenu, e);
		}
	}}
	role="button"
	tabindex={key}
>
	<p class="key">{key}</p>
	<p class="name" class:placeholder={track == null}>
		{track ? track.name : $currentDragging != null ? "Drop to link Hotkey" : ""}
	</p>
</div>
