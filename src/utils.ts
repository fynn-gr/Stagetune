import { get } from "svelte/store";
import { playlist } from "./stores";
import { emit } from "@tauri-apps/api/event";

export interface playListItem {
	type: string; //track, video, annotation
	origin: string;
	path?: string; //relative path
	name?: string; //title of the item
	length?: number; //track duration
	playing?: boolean; //is currently playing
	state?: number; //seconds playhead is at, not including cut In
	volume?: number; //sound volume, deafult is 80 out of 100
	pan?: number; //stereo pan -1 to 1
	repeat?: boolean; //repeat track option is on
	autoReset: boolean; //auto reset after pause option is on
	edit?: { in?: number; out?: number }; //cut second at beginning and end (only beginning is implemented)
	fade?: { in?: number; out?: number }; //sedonds to fade in and out
	annotation?: { text: string; color: string }; //annotation text and color, if the item is an annotation, this is also the prop used
	buffer?: AudioBuffer; //audio buffer location
	startedAt?: number; //track was started at seconds
	pausedAt?: number; // track was paused at seconds
	inFade?: "in" | "out"; //track is currently in fade or undefined
	hotkey?: string; //hotkey number assigned, undefined if not assigned
	missing: boolean; //true if file could not be found
	loaded: boolean; //if track finished loading
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
