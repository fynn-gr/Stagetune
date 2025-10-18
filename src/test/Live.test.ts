import {
	editMode,
	playlist,
	playlistElements,
	selectedItem,
} from "@/ts/Stores.svelte";
import { get } from "svelte/store";

export function testLive() {
	let timeStart = performance.now();
	let rnd: number;
	let delay: number;
	let stop = false;
	let counter = 0;
	let allowedButtons = [
		"toggle-tracks-playing",
		"toggle-hotkeys",
		"reset-all-tracks",
		"stop-all-tracks",
		"play",
		"reset",
	];
	editMode.set(true);
	document.dispatchEvent(
		new KeyboardEvent("keydown", {
			code: "KeyP",
			ctrlKey: true,
			metaKey: true,
		}),
	);
	editMode.set(false);
	document.addEventListener("keydown", e => {
		if (e.code == "Escape") stop = true;
	});
	selectedItem.set(getRndInteger(0, get(playlist).length - 1));

	const loop = () => {
		rnd = getRndInteger(0, 5);
		counter++;

		switch (rnd) {
			case 0: //select random track
				console.log(counter + " - move selecion");
				if (getRndInteger(0, 1))
					for (let i = get(selectedItem) - 1; i > -1; i--) {
						if (get(playlist)[i].type != "annotation") {
							selectedItem.set(i);
							break;
						}
					}
				break;
			case 1: //play pause
				console.log(counter + " - play or pause track");
				get(playlistElements)[get(selectedItem)].playPause(null, true);
				break;
			case 2: //skip
				console.log(counter + " - skip");
				for (let i = get(selectedItem) + 1; i < get(playlist).length; i++) {
					if (get(playlist)[i].type != "annotation") {
						get(playlistElements)[get(selectedItem)].stop(true);
						selectedItem.set(i);
						get(playlistElements)[get(selectedItem)].play(0);
						break;
					}
				}
				break;
			case 3: //reset
				console.log(counter + " - reset");
				get(playlistElements)[get(selectedItem)].stop(true, false);
				break;
			case 4: //hotkey
				console.log(counter + " - hotkey");
				document.dispatchEvent(
					new KeyboardEvent("keydown", { code: "Digit" + getRndInteger(1, 3) }),
				);
				break;
			case 5: //button press
				let button =
					allowedButtons[getRndInteger(0, allowedButtons.length - 1)];
				let target = document.getElementById("btn-" + button);
				console.log("btn-" + button);
				console.log(counter + " - button press <", target.id, ">");
				target!.dispatchEvent(new MouseEvent("click", {}));

				break;
			default:
		}

		delay = getRndInteger(2, 100);
		setTimeout(() => {
			if (stop == false) {
				loop();
			} else {
				let timeEnd = performance.now();
				const totalSeconds = Math.floor((timeEnd - timeStart) / 1000); // Convert ms to total seconds
				const minutes = Math.floor(totalSeconds / 60); // Get whole minutes
				const seconds = totalSeconds % 60; // Get remaining seconds
				console.log(`test duration: ${minutes}min ${seconds}sec`);
			}
		}, delay);
	};
	loop();
}

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
