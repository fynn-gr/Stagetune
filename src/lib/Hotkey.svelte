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
} from "@/ts/Stores.svelte";
import { onMount } from "svelte";

interface Props {
	key: number;
	track: any;
}
let { key, track = $bindable() }: Props = $props();

onMount(async () => {
	document.addEventListener("keydown", (e) => {
		if (track == null) return;
		if ($isEditing > 0 || e.ctrlKey || e.code != `Digit${key}`) {
			return;
		} else if (!e.altKey && !track.playing) {
			//play
			e.preventDefault();
			let id = $playlist.indexOf(track);
			$playlistElements[id].play(undefined, true);
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
			//$playlist = $playlist;
		}
	});
});
</script>

<div
	class="hotkeySlot"
	ondragover={e => {
		e.preventDefault();
		return false;
	}}
	ondrop={e => {
		e.preventDefault();
		addHotkey(key);
	}}
	oncontextmenu={e => {
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
						icon: "./icons/app_menu/x.svg",
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
		{track ? track.name : ($currentDragging && $currentDragging.type === "track") ? "Drop to link Hotkey" : ""}
	</p>
</div>
