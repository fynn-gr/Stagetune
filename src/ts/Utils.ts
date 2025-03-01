import { get } from "svelte/store";
import { emit } from "@tauri-apps/api/event";
import {
	currentDragging,
	draggingOrigin,
	playlist,
	selectedItem,
} from "./Stores.svelte";
import type {
	ItemType,
	PlaylistAnnotation,
	PlaylistImage,
	PlaylistTrack,
	PlaylistVideo,
	videoListElement,
} from "./Types";
import { join } from "@tauri-apps/api/path";

export function createPlaylistItem(
	type: ItemType,
	path: string,
	pathSource: string,
	name: string,
) {
	switch (type) {
		case "track":
			let newTrack: PlaylistTrack = {
				type: "track",
				path: path,
				pathSource: pathSource,
				name: name,
				length: 0,
				playing: false,
				state: 0,
				volume: 80,
				pan: 0,
				repeat: false,
				autoReset: false,
				fade: { in: 0, out: 0 },
				edit: { in: 0, out: 0 },
				annotation: null,
				buffer: null,
				startedAt: 0,
				pausedAt: 0,
				inFade: null,
				hotkey: null,
				missing: false,
				loaded: false,
			};
			playlist.update(e => {
				e.splice(get(playlist).length, 0, newTrack);
				return e;
			});
			break;
		case "video":
			let newVideo: PlaylistVideo = {
				type: "video",
				path: path,
				pathSource: pathSource,
				name: name,
				length: 0,
				playing: false,
				state: 0,
				annotation: null,
				startedAt: 0,
				pausedAt: 0,
				missing: false,
				loaded: false,
			};
			playlist.update(e => {
				e.splice(get(playlist).length, 0, newVideo);
				return e;
			});
			break;
		case "image":
			let newImage: PlaylistImage = {
				type: "image",
				path: path,
				pathSource: pathSource,
				name: name,
				playing: false,
				state: 0,
				missing: false,
				loaded: false,
			};
			playlist.update(e => {
				e.splice(get(playlist).length, 0, newImage);
				return e;
			});
			break;
	}
}

export function secondsToMinutes(inp: number): string {
	let mins = ~~((inp % 3600) / 60);
	let secs = ~~inp - mins * 60;
	let secsFormat = secs < 10 ? "0" + secs : "" + secs;
	return `${mins}:${secsFormat}`;
}

export function waveformCalc(
	buffer: AudioBuffer | null,
	samples: number,
	cutInFac: number = 0,
): number[] {
	if (buffer) {
		let rawData = buffer.getChannelData(0);
		let cutData = rawData.subarray(Math.floor(rawData.length * cutInFac));
		const blockSize = Math.floor(cutData.length / samples);
		const filteredData = [];
		for (let i = 0; i < samples; i++) {
			let blockStart = blockSize * i;
			let sum = 0;
			for (let j = 0; j < blockSize; j++) {
				sum = sum + Math.abs(cutData[blockStart + j]);
			}
			filteredData.push(sum / blockSize);
		}

		const multiplier = Math.pow(Math.max(...filteredData), -1);
		return filteredData.map(n => n * multiplier);
	} else {
		return [0];
	}
}

export async function updateProjectorList() {
	let list: Array<videoListElement> = [];

	const promises = get(playlist).map(async e => {
		if ((e.type === "video" || e.type == "image") && e.name && e.path) {
			const path = await join(e.pathSource, e.path);
			console.log("path: ", path);
			list.push({ type: e.type, name: e.name, url: path });
		} else if (e.type === "loop") {
			for (let i = 0; i < e.items?.length; i++) {
				const path = await join(e.items[i].path, e.items[i].pathSource);
				console.log("path: ", path);
				list.push({ type: "image", name: e.items[i].name, url: path });
			}
		}
	});

	// Wait for all the promises to resolve
	await Promise.all(promises);

	// Emit after the forEach is finished
	emit("updateList", { list });
}

export function setUIScale(scale: number) {
	let root: HTMLElement = document.querySelector(":root")!;
	root.style.fontSize = `${scale}px`;
}

export function mapRange(
	value: number,
	in_min: number,
	in_max: number,
	out_min: number,
	out_max: number,
): number {
	return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

export function DropHandler(newPosition: number) {
	const dragOrigin = get(draggingOrigin);
	const currentDrag = get(currentDragging);
	console.log(currentDrag);

	if (dragOrigin === "playlist" && currentDrag) {
		// move in Playlist
		const oldPosition = get(playlist).indexOf(currentDrag);
		playlist.update(e => {
			e.splice(oldPosition, 1);
			e.splice(newPosition, 0, currentDrag);
			return e;
		});
	} else if (dragOrigin === "src" && currentDrag) {
		// add new to Playlist
		console.log("drag form src to playlist: ", currentDrag);
		createPlaylistItem(
			currentDrag.type,
			currentDrag.path!,
			currentDrag.pathSource!,
			currentDrag.name!,
		),
			selectedItem.set(newPosition);
	}

	currentDragging.set(null);
}
