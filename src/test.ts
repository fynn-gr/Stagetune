import { playlist, playlistElements, selectedItem } from "@/stores";
import { get } from "svelte/store";

export function test(pen: boolean) {
	let rnd = getRndInteger(0, 4);

	switch (rnd) {
		case 0:
			//select random track
			console.log("move selecion");
			if (getRndInteger(0, 1))
				for (let i = get(selectedItem) - 1; i > -1; i--) {
					if (get(playlist)[i].type != "annotation") {
						selectedItem.set(i);
						break;
					}
				}
			break;
		case 1:
			//play pause
			console.log("play or pause track");
			get(playlistElements)[get(selectedItem)].playPause(null, true);
			break;
		case 2:
			//skip
			console.log("skip");
			for (let i = get(selectedItem) + 1; i < get(playlist).length; i++) {
				if (get(playlist)[i].type != "annotation") {
					get(playlistElements)[get(selectedItem)].stop(true);
					selectedItem.set(i);
					get(playlistElements)[get(selectedItem)].play(0);
					break;
				}
			}
			break;
		case 3:
			//reset
			console.log("reset");
			get(playlistElements)[get(selectedItem)].stop(true, false);
			break;
		case 4:
			//hotkey
			console.log("hotkey");
			document.dispatchEvent(
				new KeyboardEvent("keydown", { code: "Digit" + getRndInteger(1, 2) })
			);
			break;
	}

	let delay = pen ? getRndInteger(2, 200) : getRndInteger(10, 10000);

	setTimeout(() => {
		test(pen);
	}, delay);
}

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
