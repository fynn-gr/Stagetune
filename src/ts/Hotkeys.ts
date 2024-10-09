import { get } from "svelte/store";
import { currentDragging, draggingOrigin, hotkeys, playlist } from "./Stores";
import { createPlaylistTrack } from "./Utils";

export function addHotkey(key: number) {
	if (get(draggingOrigin) == "src" && get(currentDragging)!.type == "track") {
		console.log("drop form src", key);

		// Dropping Track from src Tracklist, create Track in Playlist and add Hotkey
		rmHotkeyForSameTrack();
		createPlaylistTrack(
			get(currentDragging)!.type,
			get(currentDragging)!.path!,
			get(currentDragging)!.name!,
		);
		playlist.update(e => {
			e[e.length - 1].hotkey = key;
			return e;
		});
		hotkeys.update(e => {
			e[key - 1].track = get(playlist)[get(playlist).length - 1];
			return e;
		});

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
		hotkeys.update(e => {
			e[key - 1].track = get(currentDragging);
			return e;
		});
		playlist.update(e => {
			return e;
		});

		currentDragging.set(null);
	} else {
		// unknown item dropped
		currentDragging.set(null);
	}
}

export function rmHotkey(key: number) {
	hotkeys.update(h => {
		h[key - 1].track!.hotkey = null;
		h[key - 1].track = null;

		return h;
	});
	playlist.update(e => {
		return e;
	});
}

function rmHotkeyForSameTrack() {
	hotkeys.update(i => {
		i.forEach(e => {
			if (e.track === get(currentDragging)) {
				e.track!.hotkey = null;
				e.track = null;
			}
		});
		return i;
	});
}
