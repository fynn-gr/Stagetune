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
	srcPaths,
	srcFiles,
	currentDragging,
	hotkeys,
	recent,
	localFiles,
} from "./stores";

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
	edit?: { in?: number; out?: number };
	fade?: { in?: number; out?: number };
	annotation?: { before: string; after: string };
	buffer?: AudioBuffer;
	startedAt?: number;
	pausedAt?: number;

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
				console.log("nothing selected");
			} else {
				//add to src paths
				scanSrcPaths(sel);
				playlistPath.set(sel)
				console.log("srcFiles: ", get(srcFiles));
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
	console.log(entries)

	function processEntries(entries) {
		entries.forEach((entry, j) => {
			console.log(`Entry: `, entry.path);
			if (entry.children) {
				//subfolder
				processEntries(entry.children);
			} else if (isAudioFile(entry.path)) {
				//Audio File
				console.log("audio File")
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
				console.log("Playlist File")
				playlistFile = entry.path;
				readTextFile(playlistFile, {})
				.then((e) => {
					console.log("load playlist")
					let obj = JSON.parse(e);
					playlist.set(obj.playlist);
					//srcPaths.set(obj.srcPaths);
					hotkeys.set(obj.hotkeys);
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

	console.log(get(srcFiles), get(playlist))
}

export function openPlaylist(file: string = null) {
	try {
		open({
			directory: false,
			multiple: false,
			title: "open Playlist"
		}).then(async (sel) => {
			if (sel == null || Array.isArray(sel)) {
				console.log("nothing selected");
			} else if (isPlaylistFile(sel)) {
				readTextFile(sel, {}).then((e) => {
					let obj = JSON.parse(e);
					playlist.set(obj.playlist);
					srcPaths.set(obj.srcPaths);
					hotkeys.set(obj.hotkeys);
					//scanSrcPaths();
				});
			}
		});
	} catch (err) {
		console.error(err);
	}
}

export function savePlaylist(save_as: boolean = false) {
	if (save_as || get(playlistPath) == "") {
		//ask for path
		try {
			save({
				filters: [
					{
						name: "pureStage Playlist",
						extensions: ["playlist"],
					},
				],
			}).then(async (sel) => {
				if (sel == null) {
					console.log("nothing selected");
				} else {
					let saveObj = {
						meta: {
							version: "0.1",
							fileVersion: 1
						},
						playlist: get(playlist),
						srcPaths: get(srcPaths),
						hotkeys: get(hotkeys),
					};
					writeTextFile(sel, JSON.stringify(saveObj), {});
					playlistPath.set(sel);
				}
			});
		} catch (err) {
			console.error(err);
		}
	} else {
		//save to known path
		console.log("save to path: ", get(playlistPath));
		let saveObj = {
			playlist: get(playlist),
			//srcPaths: get(srcPaths),
			hotkeys: get(hotkeys),
		};
		writeTextFile(get(playlistPath) + "/playlist.playlist", JSON.stringify(saveObj), {});
	}
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
