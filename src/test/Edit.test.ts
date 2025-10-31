import {
	editMode,
	playlist,
	playlistElements,
	selectedItem,
} from "@/ts/Stores.svelte";
import { get } from "svelte/store";

export function testEdit() {
	console.time("testLoop");
	editMode.set(true);
	let rnd: number;
	let delay: number;
	let stop = false;
	let counter = 0;
	let allowedButtons = [
		"sidebar",
		"toggle-editor",
		"toggle-tracks-playing",
		"toggle-hotkeys",
		"comment-add",
		"reset-all-tracks",
		"stop-all-tracks",
		"projector",
		"play",
		"reset",
		"repeat",
		"auto-reset",
		"add-attached-anotation",
	];
	document.addEventListener("keydown", e => {
		if (e.code == "Escape") stop = true;
	});
	selectedItem.set(getRndInteger(0, playlist.length - 1));

	const loop = () => {
		rnd = getRndInteger(0, 5);
		counter++;

		switch (rnd) {
			case 0: //select random track
				console.log(counter + " - move selecion");
				if (getRndInteger(0, 1))
					for (let i = get(selectedItem) - 1; i > -1; i--) {
						if (playlist[i].type != "annotation") {
							selectedItem.set(i);
							break;
						}
					}
				break;
			case 1: //play pause
				console.log(counter + " - play or pause track");
				playlistElements[get(selectedItem)].playPause(null, true);
				break;
			case 2: //skip
				console.log(counter + " - skip");
				for (let i = get(selectedItem) + 1; i < playlist.length; i++) {
					if (playlist[i].type != "annotation") {
						playlistElements[get(selectedItem)].stop(true);
						selectedItem.set(i);
						playlistElements[get(selectedItem)].play(0);
						break;
					}
				}
				break;
			case 3: //reset
				console.log(counter + " - reset");
				playlistElements[get(selectedItem)].stop(true, false);
				break;
			case 4: //hotkey
				console.log(counter + " - hotkey");
				document.dispatchEvent(
					new KeyboardEvent("keydown", { code: "Digit" + getRndInteger(1, 2) }),
				);
				break;
			case 5: //button press
				let button =
					allowedButtons[getRndInteger(0, allowedButtons.length - 1)];
				let target = document.getElementById("btn-" + button);
				console.log("btn-" + button);
				try {
					console.log(counter + " - button press <", target.title, ">");
					target!.dispatchEvent(new MouseEvent("click", {}));
				} catch {}
				break;
			default:
		}

		delay = getRndInteger(2, 100);
		setTimeout(() => {
			if (stop == false) {
				loop();
			} else {
				console.timeEnd("testLoop");
			}
		}, delay);
	};
	loop();
}

function getRndInteger(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
