import { get } from "svelte/store";
import { emit } from "@tauri-apps/api/event";
import {
	currentDragging,
	draggingOrigin,
	playlist,
	selectedItem,
} from "./Stores";
import type { ItemType, PlaylistItem } from "./Types";
import { Menu, MenuItem } from "@tauri-apps/api/menu";

export function createPlaylistTrack(
	type: ItemType,
	path: string,
	name: string,
): PlaylistItem {
	return {
		type,
		path,
		name,
		playing: false,
		state: 0,
		volume: 80,
		pan: 0,
		repeat: false,
		autoReset: false,
		fade: { in: 0, out: 0 },
		edit: { in: 0, out: 0 },
		annotation: null,
		startedAt: 0,
		pausedAt: 0,
		inFade: null,
		missing: false,
		loaded: false,
	};
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
		//console.log("cant calc Waveform");
		return [0];
	}
}

export function updateProjectorList() {
	let list: { name: string; url: string }[] = [];
	get(playlist).forEach(e => {
		if (e.type === "video" && e.name && e.path) {
			list.push({ name: e.name, url: e.path });
		}
	});

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

	if (dragOrigin === "playlist" && currentDrag) {
		const oldPosition = get(playlist).indexOf(currentDrag);
		playlist.update(e => {
			e.splice(oldPosition, 1);
			e.splice(newPosition, 0, currentDrag);
			return e;
		});
	} else if (dragOrigin === "src" && currentDrag) {
		playlist.update(e => {
			e.splice(
				newPosition,
				0,
				createPlaylistTrack(
					currentDrag.type,
					currentDrag.path!,
					currentDrag.name!,
				),
			);
			return e;
		});
		selectedItem.set(newPosition);
	}

	currentDragging.set(null);
}

export async function createMenus() {
	const menu = await Menu.new({
		items: [
			await MenuItem.new({
				text: "test",
				action: () => {
					console.log("test")
				}
			})
		]
	})
}