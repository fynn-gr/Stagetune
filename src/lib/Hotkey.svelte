<script lang="ts">
	import {
		hotkeys,
		currentDragging,
		isEditing,
		editMode,
		playlist,
		playlistElements,
	} from "@/stores";
	import { createPlaylistTrack } from "@/utils";
	import { onMount } from "svelte";

	export let key: string;
	export let track: any = null;
	let isPlaying = false;

	async function handleDropHotkeys(e) {
		e.preventDefault();

		if ($currentDragging.origin == "src" && $currentDragging.type == "track") {
			playlist.update((e) => {
				e.splice(
					$playlist.length,
					0,
					createPlaylistTrack(
						"playlist",
						$currentDragging.type,
						$currentDragging.path,
						$currentDragging.name
					)
				);
				return e;
			})
			$playlist[$playlist.length - 1].hotkey = key;
			track = $playlist[$playlist.length -1];

			$currentDragging = null;
		} else if (
			$currentDragging.origin == "playlist" &&
			$currentDragging.type == "track"
		) {
			console.log($currentDragging);

			$currentDragging.hotkey = key;
			track = $currentDragging;

			$currentDragging = null;
		} else {
			$currentDragging = null;
		}

		console.log("hotkeys", $hotkeys);
	}

	onMount(async () => {
		document.addEventListener("keydown", (e) => {
			if ($isEditing > 0 || e.ctrlKey || e.code != `Digit${key}`) {
				return;
			} else if (!e.altKey && !track.playing) {
				//play
				e.preventDefault();
				console.log($playlist[$playlist.indexOf(track)], track)
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
				track.key = undefined;
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
	on:dragover={(e) => {
		e.preventDefault();
		return false;
	}}
	on:drop={handleDropHotkeys}
>
	<p class="key">{key}</p>
	<p class="name" class:placeholder={track == null}>
		{track ? track.name : ""}
	</p>
</div>
