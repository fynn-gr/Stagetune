import { get } from "svelte/store";
import { playlist } from "./stores";
import { emit } from "@tauri-apps/api/event";

export interface playListItem {
	type: string; //track, video, annotation, loop
	origin: string;

	//track, video
	path?: string;
	name?: string;
	length?: number;
	playing?: boolean;
	state?: number;
	volume?: number;
	pan?: number;
	repeat?: boolean;
	autoReset: boolean;
	edit?: { in?: number; out?: number };
	fade?: { in?: number; out?: number };
	annotation?: { text: string; color: string };
	buffer?: AudioBuffer;
	startedAt?: number;
	pausedAt?: number;
	inFade?: "in" | "out";
	hotkey?: string;
	missing: boolean;

	//loop
	tracks?: Array<playListItem>;
}

export function createPlaylistTrack(
	origin: string,
	type: string,
	path: string,
	name: string
): playListItem {
	return {
		type: type,
		origin: origin,
		path: path,
		name: name,
		playing: false,
		state: 0, //seconds playing since start
		volume: 80, //volume (standart is 80 of 100 max)
		pan: 0, // -1 to 1
		repeat: false,
		autoReset: false,
		fade: { in: 0, out: 0 }, //fade in and out in seconds
		edit: { in: 0, out: 0 }, // cut in in seconds (TODO: cutout)
		annotation: null,
		startedAt: 0, //ctx time track started at
		pausedAt: 0, //track time paused at
		inFade: null,
		missing: false,
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
	try {
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
	} catch (err) {
		console.error(err);
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
