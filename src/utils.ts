import { open, save } from "@tauri-apps/api/dialog";
import { get } from "svelte/store";
import { readDir, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { playlist, playlistPath, srcPaths, srcFiles, currentDragging, hotkeys } from "./stores";

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

export function waveformCalc(buffer: AudioBuffer, samples: number): Array<any> {
	let rawData = buffer.getChannelData(0);
	const blockSize = Math.floor(rawData.length / samples);
	const filteredData = [];
	for (let i = 0; i < samples; i++) {
		let blockStart = blockSize * i;
		let sum = 0;
		for (let j = 0; j < blockSize; j++) {
			sum = sum + Math.abs(rawData[blockStart + j])
		}
		filteredData.push(sum / blockSize);
	}

	const multiplier = Math.pow(Math.max(...filteredData), -1);
	return filteredData.map(n => n * multiplier);
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
				if (get(srcPaths).includes(sel)) return;
				srcPaths.update((items) => {
					items.push(sel);
					return items;
				});
				console.log("srcPaths: ", get(srcPaths));
				console.log("srcFiles: ", get(srcFiles));
				scanSrcPaths();
			}
		});
	} catch (err) {
		console.error(err);
	}
}

function scanSrcPaths() {
	srcFiles.set([]);
	get(srcPaths).forEach(async (e, i) => {
		srcFiles.update((itmes) => {
			itmes.push([]);
			return itmes;
		});

		//go through individual src paths
		const entries = await readDir(e, { recursive: true });

		function processEntries(entries) {
			entries.forEach((entry, j) => {
				console.log(`Entry: `, entry.path);
				if (entry.children) {
					//subfolder
					processEntries(entry.children);
				} else if (isAudioFile(entry.name)) {
					//Audio File
					entry.type = "track";
					srcFiles.update((items) => {
						items[i].push(entry);
						return items;
					});
				} else if (isVideoFile(entry.name)) {
					//Video File
					entry.type = "video";
					srcFiles.update((items) => {
						items[i].push(entry);
						return items;
					});
				} else {
				}
			});
		}
		processEntries(entries);

		//sort alphabetically

		srcFiles.update((items) => {
			items.forEach((e) => {
				e.sort(function (a, b) {
					if (a.name < b.name) {
						return -1;
					}
					if (a.name > b.name) {
						return 1;
					}
					return 0;
				});
			});
			return items;
		});
	});
}

export function openPlaylist() {
	try {
		open({
			directory: false,
			multiple: false,
			title: "open Playlist",
		}).then(async (sel) => {
			if (sel == null || Array.isArray(sel)) {
				console.log("nothing selected");
			} else if (isPlaylistFile(sel)) {
				readTextFile(sel, {}).then((e) => {
					let obj = JSON.parse(e);
					playlist.set(obj.playlist);
					srcPaths.set(obj.srcPaths);
					hotkeys.set(obj.hotkeys)
					scanSrcPaths();
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
		console.log("save to path: ", get(playlistPath))
		let saveObj = {
			playlist: get(playlist),
			srcPaths: get(srcPaths),
			hotkeys: get(hotkeys), 
		};
		writeTextFile(get(playlistPath), JSON.stringify(saveObj), {});
	}

}