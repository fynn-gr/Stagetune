import { get } from "svelte/store";
import { playlist } from "./stores";
import { emit } from "@tauri-apps/api/event";
import type { playListItem } from "./types";


export function createPlaylistTrack(
	type: string,
	path: string,
	name: string
): playListItem {
	return {
		type: type,
		path: path,
		name: name,
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

export function isAudioFile(filename: string): boolean {
	if (filename.match(/\.(mp3|ogg|aac|flac|wav|m4a)$/)) {
		return true;
	} else {
		return false;
	}
}

export function isVideoFile(filename: string): boolean {
	if (filename.match(/\.(mp4|mov|mkv|m4v|mpg|avi|webm)$/)) {
		return true;
	} else {
		return false;
	}
}

export function isPlaylistFile(filename: string): boolean {
	if (filename.match(/\.(Stagetune)$/)) {
		return true;
	} else {
		return false;
	}
}

export function secondsToMinutes(inp: number) {
	let mins = ~~((inp % 3600) / 60);
	let secs = ~~inp - mins * 60;
	let secsFormat = secs < 10 ? "0" + secs : "" + secs;
	return `${mins}:${secsFormat}`;
}

export function fileNameFromPath(filename: string) {
	let str = filename.substring(filename.lastIndexOf("\\") + 1);
	return str.substring(str.lastIndexOf("/") + 1);
}

export function waveformCalc(
	buffer: AudioBuffer,
	samples: number,
	cutInFac: number = 0
): Array<any> {
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
	let list = [];
	get(playlist).forEach(e => {
		if (e.type == "video") {
			list.push({ name: e.name, url: e.path });
		}
	});

	emit("updateList", { list });
}

export function setUIScale(scale: number) {
	let root: HTMLElement = document.querySelector(":root");
	root.style.fontSize = `${scale}px`;
}

export function mapRange(value, in_min, in_max, out_min, out_max) {
	return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

export function verionCompare(version: string, compareWith) {
	let versionBase = version.split(".");
	let versionCompare = compareWith.split(".");
}
