import { open, save } from "@tauri-apps/api/dialog";
import { get } from "svelte/store";
import {
	BaseDirectory,
	readDir,
	readTextFile,
	writeTextFile,
} from "@tauri-apps/api/fs";
import {
	playlist,
	playlistPath,
	srcFiles,
	currentDragging,
	hotkeys,
	recent,
	localFiles,
} from "./stores";
import { emit } from "@tauri-apps/api/event";

export interface playListItem {
	type: string; //track, video, annotation, loop
	origin: string;

	//comment
	text?: string;

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
	annotation?: { before: string; after: string };
	buffer?: AudioBuffer;
	startedAt?: number;
	pausedAt?: number;
	hotkey?: string;

	//loop
	tracks?: Array<playListItem>;
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
	if (filename.match(/\.(playlist)$/)) {
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
	return filteredData.map((n) => n * multiplier);
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
		fade: { in: 0, out: 0 }, //fade in and out in seconds
		edit: { in: 0, out: 0 }, // cut in in seconds (TODO: cutout)
		annotation: { before: null, after: null },
		startedAt: 0, //ctx time track started at
		pausedAt: 0, //track time paused at
	};
}

export function openDir() {
	try {
		open({
			directory: true,
			multiple: false,
		}).then(async (sel) => {
			if (sel == null) {

			} else {
				//add to src paths
				scanSrcPaths(sel as string);
				playlistPath.set(sel as string)
				recent.update(e => {
					e.push(sel);
					return e;
				})
			}
		});
	} catch (err) {
		console.error(err);
	}
}

async function scanSrcPaths(path: string) {
	let playlistFile: string;

	//recursive scan src path
	const entries = await readDir(path, { recursive: true });

	function processEntries(entries) {
		entries.forEach((entry, j) => {
			console.log(`File: `, entry.path);
			if (entry.children) {
				//subfolder
				processEntries(entry.children);
			} else if (isAudioFile(entry.path)) {
				//Audio File
				entry.type = "track";
				entry.origin = "src";
				entry.name = entry.name.replace(/\.[^.]+$/gm, "");
				srcFiles.update((items) => {
					items.push(entry);
					return items;
				});
			} else if (isVideoFile(entry.path)) {
				//Video File
				entry.type = "video";
				entry.origin = "src";
				entry.name = entry.name.replace(/\.[^.]+$/gm, "");
				srcFiles.update((items) => {
					items.push(entry);
					return items;
				});
			} else if (isPlaylistFile(entry.path)) {
				playlistFile = entry.path;
				readTextFile(playlistFile, {})
				.then((e) => {
					let obj = JSON.parse(e);
					playlist.set(obj.playlist);
					hotkeys.set(obj.hotkeys);

					get(hotkeys).forEach(e => {
						if (e.track != null) {
							let ref = get(playlist)[e.track];
							e.track = ref;
						}
					});
				});
			} else {}
		});

		//sort alphabetically
		srcFiles.update((items) => {
			items.sort(function (a, b) {
				if (a.name < b.name) {
					return -1;
				}
				if (a.name > b.name) {
					return 1;
				}
				return 0;
			});
			return items;
		});
	}
	processEntries(await entries);
}

export function savePlaylist() {
	//save to known path
	console.log("save to path: ", get(playlistPath));
	
	let saveObj = {
		meta: {
			version: "0.1.0",
			fileVersion: 1
		},
		playlist: get(playlist),
		hotkeys: []
	};

	saveObj.playlist.forEach(e => {
		e.playing = false;
		e.state = 0;
		e.startedAt = 0;
		e.pausedAt = 0;
		e.buffer = null;
	})

	get(hotkeys).forEach(e => {
		if (e.track != null) {
			saveObj.hotkeys.push({
				key: e.key,
				track: get(playlist).indexOf(e.track)
			})
		} else {
			saveObj.hotkeys.push({
				key: e.key,
				track: null
			})
		}
	})

	writeTextFile(get(playlistPath) + "/playlist.playlist", JSON.stringify(saveObj), {});
	saveRecent();
}

export function saveRecent() {
	console.log("save: ", get(recent));
	writeTextFile("recent.json", JSON.stringify(get(recent)), {
		dir: BaseDirectory.Document,
	});
}

export async function loadRecent() {
	const obj = await readTextFile("recent.json", {
		dir: BaseDirectory.Document,
	});
	recent.set(JSON.parse(obj));
}

export function updateProjectorList() {
	let list = [];
	get(playlist).forEach(e => {
		if (e.type == "video") {
			list.push({	name: e.name, url: e.path })
		}
	})

	emit("updateList", {list})
}