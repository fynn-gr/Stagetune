<script lang="ts">
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
let isPlaying = false;

async function handleDropHotkeys(e: Event) {
	e.preventDefault();

	if ($draggingOrigin == "src" && $currentDragging!.type == "track") {
		checkOtherHotkeys();
		playlist.update(e => {
			e.splice(
				$playlist.length,
				0,
				createPlaylistTrack(
					$currentDragging!.type,
					$currentDragging!.path!,
					$currentDragging!.name!,
				),
			);
			return e;
		});
		$playlist[$playlist.length - 1].hotkey = key;
		track = $playlist[$playlist.length - 1];

		$currentDragging = null;
	} else if (
		$draggingOrigin == "playlist" &&
		$currentDragging!.type == "track"
	) {
		console.log($currentDragging);
		checkOtherHotkeys();

		$currentDragging!.hotkey = key;
		$playlist = $playlist;
		track = $currentDragging;

		$currentDragging = null;
	} else {
		$currentDragging = null;
	}

	console.log("hotkeys", $hotkeys);
}

//check there are no other Hotkeys for the same track an if, delete them
function checkOtherHotkeys() {
	$hotkeys.forEach(e => {
		if (e.track === $currentDragging) {
			console.log("track exists", e.track)
			e.track!.hotkey = undefined;
			e.track = null;
		}
	})
}

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
		}
	});
});

$: if (track != null) {
	isPlaying = track.playing;
}
</script>

<div
	class="hotkeySlot"
	class:playing={isPlaying}
	on:dragover={e => {
		e.preventDefault();
		return false;
	}}
	on:drop={handleDropHotkeys}
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
							track.key = undefined;
							track = null;
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
		{track ? track.name : $currentDragging != null ? "link to Hotkey" : ""}
	</p>
</div>
