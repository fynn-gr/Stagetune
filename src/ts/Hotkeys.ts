import { get } from "svelte/store";
import {
	currentDragging,
	draggingOrigin,
	hotkeys,
	playlist,
} from "./Stores.svelte";
import { createPlaylistItem } from "./Utils";

export function addHotkey(key: number) {
	if (get(draggingOrigin) == "src" && get(currentDragging)!.type == "track") {
		console.log("drop form src", key);

		// Dropping Track from src Tracklist, create Track in Playlist and add Hotkey
		rmHotkeyForSameTrack();
		createPlaylistItem(
			get(currentDragging)!.type,
			get(currentDragging)!.path!,
			get(currentDragging)?.pathSource!,
			get(currentDragging)!.name!,
		);
		playlist[playlist.length - 1].hotkey = key;
		hotkeys[key - 1].track = playlist[playlist.length - 1];

		currentDragging.set(null);
	} else if (
		get(draggingOrigin) == "playlist" &&
		get(currentDragging)?.type == "track"
	) {
		// Dropping Track from Playlist, adding existing track to Hotkey
		rmHotkeyForSameTrack();
		currentDragging.update(e => {
			e!.hotkey = key;
			return e;
		});
		hotkeys[key - 1].track = get(currentDragging);

		currentDragging.set(null);
	} else {
		// unknown item dropped
		currentDragging.set(null);
	}
}

export function rmHotkey(key: number) {
	hotkeys[key - 1].track!.hotkey = null;
	hotkeys[key - 1].track = null;
}

function rmHotkeyForSameTrack() {
	hotkeys.forEach(e => {
		if (e.track === get(currentDragging)) {
			e.track!.hotkey = null;
			e.track = null;
		}
	});
}
