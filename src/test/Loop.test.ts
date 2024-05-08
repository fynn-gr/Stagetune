import { playlist, playlistElements, selectedItem } from "@/stores";
import { get } from "svelte/store";

export function test(pen: boolean) {
	let rnd: number;
	let delay: number;
	let stop = false;
	let allowedButtons = [
		"Toggle Tracklist",
		"Add comment",
		"Toggle Mode",
		"Reset all tracks",
		"Stop all tracks",
		"Toggle Edior",
		"Toggle Tracks playing",
		"Toggle Hotkeys",
		"Play",
		"Reset",
		"repeat track",
		"auto reset track on pause",
		"Add attached anotation",
		"current playing",
	];
	document.addEventListener("keydown", e => {
		if (e.code == "Escape") stop = true;
	});
	selectedItem.set(getRndInteger(0, get(playlist).length - 1));

	const loop = () => {
		rnd = getRndInteger(0, 5);

		switch (rnd) {
			case 0: //select random track
				console.log("move selecion");
				if (getRndInteger(0, 1))
					for (let i = get(selectedItem) - 1; i > -1; i--) {
						if (get(playlist)[i].type != "annotation") {
							selectedItem.set(i);
							break;
						}
					}
				break;
			case 1: //play pause
				console.log("play or pause track");
				get(playlistElements)[get(selectedItem)].playPause(null, true);
				break;
			case 2: //skip
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
			case 3: //reset
				console.log("reset");
				get(playlistElements)[get(selectedItem)].stop(true, false);
				break;
			case 4: //hotkey
				console.log("hotkey");
				document.dispatchEvent(
					new KeyboardEvent("keydown", { code: "Digit" + getRndInteger(1, 2) })
				);
				break;
			case 5: //button press
				let buttons = document.querySelectorAll("button");
				let button = buttons[getRndInteger(0, buttons.length - 1)];
				if (allowedButtons.includes(button.title)) {
					console.log("button press", button.title);
					button.dispatchEvent(new MouseEvent("click", {}));
				} else {
					console.log("not allowed button");
				}
				break;
			default:
		}

		delay = pen ? getRndInteger(2, 200) : getRndInteger(10, 10000);
		setTimeout(() => {
			if (stop == false) loop();
		}, delay);
	};
	loop();
}

function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
