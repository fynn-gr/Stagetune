//Tauri
import { message, open, save } from "@tauri-apps/plugin-dialog";
import { getVersion } from "@tauri-apps/api/app";
import { basename, join } from "@tauri-apps/api/path";
import { emit } from "@tauri-apps/api/event";
import {
	BaseDirectory,
	mkdir,
	exists,
	readDir,
	readTextFile,
	writeTextFile,
	type DirEntry,
} from "@tauri-apps/plugin-fs";

// Stores, Utils
import { isAudioFile, isVideoFile, isImageFile } from "./FileUtils";
import { get } from "svelte/store";
import {
	playlist,
	playlistPath,
	srcFiles,
	hotkeys,
	settings,
	splash,
} from "./Stores";
import type { PlaylistItem, SaveFile } from "./Types";

export async function openPlaylist() {
	try {
		const sel = await open({
			multiple: false,
			filters: [
				{
					name: "Playlist",
					extensions: ["spl"],
				},
			],
		});

		if (!sel) return;

		playlistPath.set(sel as string);
		readTextFile(sel, {}).then(e => {
			const obj = JSON.parse(e);
			srcFiles.set(obj.srcFiles);
			playlist.set(obj.playlist);
			hotkeys.set(obj.hotkeys);

			get(hotkeys).forEach(e => {
				if (e.track != null) {
					const ref = get(playlist)[e.track];
					e.track = ref;
				}
			});
		});
	} catch (err) {
		console.error(err);
	}
}

export async function openDir() {
	try {
		const sel = await open({
			directory: true,
			multiple: false,
		});

		if (!sel) return;

		let src = get(srcFiles);
		for (let i = 0; i < src.length; i++) {
			if (src[i].path === sel) {
				message("Directory already added", {
					title: "already added",
					kind: "error",
				});
				return;
			}
		}
		srcFiles.update(e => {
			e.push({ path: sel, files: [] });
			return e;
		});
		scanSrcPaths(sel as string);
	} catch (err) {
		console.error(err);
	}
}

export async function relinkDir(pathIndex: number) {
	try {
		const sel = await open({
			directory: true,
			multiple: false,
		});
		if (!sel) return;

		srcFiles.update(e => {
			for (let i = 0; i < e.length; i++) {
				e[i].path = sel;
			}
			return e;
		});
	} catch (err) {
		console.error(err);
	}
}

export async function scanSrcPaths(selPath: string) {
	try {
		// Recursive scan of src path
		async function processDirRecursive(path: string) {
			const entries = await readDir(path);
			console.log(entries);

			//loop over entries
			entries.forEach(async (entry: DirEntry) => {
				if (entry.isDirectory) {
					// Subfolder
					// TODO CUrrently disabled
					// processDirRecursive(await join(selPath, entry.name));
				} else if (isAudioFile(entry.name)) {
					// Audio File
					const modifiedPath = await basename(entry.name);
					const obj = {
						type: "track",
						name: entry.name.replace(/\.[^.]+$/gm, ""),
						path: modifiedPath,
						pathSource: selPath,
					};
					srcFiles.update(items => {
						let index = items.findIndex(obj => obj.path === selPath);
						items[index].files.push(obj);
						return items;
					});
				} else if (isVideoFile(entry.name)) {
					// Video File
					const modifiedPath = await basename(entry.name);
					const obj = {
						type: "video",
						name: entry.name.replace(/\.[^.]+$/gm, ""),
						path: modifiedPath,
						pathSource: selPath,
					};
					srcFiles.update(items => {
						let index = items.findIndex(obj => obj.path === selPath);
						items[index].files.push(obj);
						return items;
					});
				} else if (isImageFile(entry.name)) {
					// Image File
					const modifiedPath = await basename(entry.name);
					const obj = {
						type: "image",
						name: entry.name.replace(/\.[^.]+$/gm, ""),
						path: modifiedPath,
						pathSource: selPath,
					};
					srcFiles.update(items => {
						let index = items.findIndex(obj => obj.path === selPath);
						items[index].files.push(obj);
						return items;
					});
				} else {
					// Other cases
				}
			});
		}

		processDirRecursive(selPath);
	} catch (err) {
		console.error(err);
	}
}

export async function savePlaylist() {
	//test if allready saved
	if (get(playlistPath) == "") {
		// save as
		const sel = await save({
			title: "save Playlist as",
			defaultPath: "Playlist.spl",
		});
		if (!sel) return;
		playlistPath.set(sel);
	}

	const path = get(playlistPath);
	console.log("Save to path:", path);

	// Create object with version and playlist
	const saveObj: SaveFile = {
		meta: {
			version: await getVersion(),
		},
		playlist: JSON.parse(JSON.stringify(get(playlist))),
		hotkeys: [],
		srcFiles: get(srcFiles),
	};

	// Remove unwanted attributes, remove Buffer
	saveObj.playlist.forEach((e: PlaylistItem) => {
		e.playing = false;
		e.state = 0;
		e.startedAt = 0;
		e.pausedAt = 0;
		e.inFade = null;
		e.buffer = undefined;
	});

	// Save every Hotkey slot
	get(hotkeys).forEach(e => {
		if (e.track != null) {
			saveObj.hotkeys.push({
				key: e.key,
				track: get(playlist).indexOf(e.track),
			});
		} else {
			saveObj.hotkeys.push({
				key: e.key,
				track: null,
			});
		}
	});

	// Write file to disk
	writeTextFile(path, JSON.stringify(saveObj), {});
}

export function saveSettings() {
	let currentVersion: string;
	getVersion()
		.then(v => {
			currentVersion = v.slice(0, v.lastIndexOf("."));
		})
		.then(() => {
			console.log("save: ", get(settings));
			writeTextFile(
				`Stagetune/${currentVersion}/settings.json`,
				JSON.stringify(get(settings)),
				{
					baseDir: BaseDirectory.Config,
				},
			);
			emit("reload_settings");
		});
}

export async function loadSettings(activateSplash = false) {
	let currentVersion;

	getVersion().then(v => {
		currentVersion = v.slice(0, v.lastIndexOf("."));
		readTextFile(`Stagetune/${currentVersion}/settings.json`, {
			baseDir: BaseDirectory.Config,
		}).then(e => {
			settings.set(JSON.parse(e));
			console.log("loaded settings", get(settings));

			if (activateSplash) splash.set(get(settings).show_splash);
			console.log("ui scale. ", get(settings).ui_scale);
			document.documentElement.style.cssText = `font-size: ${
				get(settings).ui_scale
			}px`;
		});
	});
}

export function checkSettingsExist() {
	let currentVersion: string;

	getVersion().then(v => {
		currentVersion = v.slice(0, v.lastIndexOf("."));
		exists(`Stagetune/${currentVersion}/settings.json`, {
			baseDir: BaseDirectory.Config,
		}).then(e => {
			if (e) {
				loadSettings(true);
			} else {
				mkdir(`Stagetune/${currentVersion}`, {
					baseDir: BaseDirectory.Config,
					recursive: true,
				});
				saveSettings();
			}
		});
	});
}
