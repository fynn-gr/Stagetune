//Tauri
import { open } from "@tauri-apps/api/dialog";
import { getVersion } from "@tauri-apps/api/app";
import { basename } from "@tauri-apps/api/path";
import { emit } from "@tauri-apps/api/event";
import {
	BaseDirectory,
	createDir,
	exists,
	readDir,
	readTextFile,
	writeTextFile,
} from "@tauri-apps/api/fs";

// Stores, Utils
import { isAudioFile, isVideoFile, isPlaylistFile } from "./FileUtils";
import { get, writable } from "svelte/store";
import {
	playlist,
	playlistPath,
	srcFiles,
	hotkeys,
	settings,
	splash,
} from "./Stores";
import type { PlaylistItem, SaveFile } from "./Types";

export async function openDir() {
	try {
		const sel = await open({
			directory: true,
			multiple: false,
		});

		if (!sel) return;

		scanSrcPaths(sel as string);
		playlistPath.set(sel as string);

		//add to recent
		/*
		settings.update(e => {
			if (e.recent[0] == sel) {
				//e.recent.unshift(sel);
			} else if (e.recent.indexOf(sel) != -1) {
				e.recent.splice(e.recent.indexOf(sel), 1);
				e.recent.unshift(sel);
			} else {
				e.recent.unshift(sel);
			}

			if (e.recent.length > 5) {
				e.recent.pop();
			}
			return e;
		});
		saveSettings();
		*/
	} catch (err) {
		console.error(err);
	}
}

export async function scanSrcPaths(path: string) {
	try {
		let playlistFile: string;

		// Recursive scan of src path
		const entries = await readDir(path, { recursive: true });

		function processEntries(entries: any[]) {
			entries.forEach(async (entry: any, j) => {
				if (entry.children) {
					// Subfolder
					processEntries(entry.children);
				} else if (isAudioFile(entry.path)) {
					// Audio File
					entry.type = "track";
					entry.origin = "src";
					entry.name = entry.name.replace(/\.[^.]+$/gm, "");
					const modifiedPath = await basename(entry.path);
					console.log(modifiedPath);
					entry.path = modifiedPath;
					srcFiles.update(items => {
						items.push(entry);
						return items;
					});
				} else if (isVideoFile(entry.path)) {
					// Video File
					/*entry.type = "video";
					entry.origin = "src";
					entry.name = entry.name.replace(/\.[^.]+$/gm, "");
					srcFiles.update(items => {
						items.push(entry);
						return items;
					})*/
				} else if (isPlaylistFile(entry.path)) {
					// Playlist File
					playlistFile = entry.path;
					readTextFile(playlistFile, {}).then(e => {
						const obj = JSON.parse(e);
						playlist.set(obj.playlist);
						hotkeys.set(obj.hotkeys);

						get(hotkeys).forEach(e => {
							if (e.track != null) {
								const ref = get(playlist)[e.track];
								e.track = ref;
							}
						});
					});
				} else {
					// Other cases
				}
			});

			// Sort alphabetically
			srcFiles.update(items => {
				items.sort((a, b) => a.name.localeCompare(b.name));
				return items;
			});
		}

		processEntries(entries);
	} catch (err) {
		console.error(err);
	}
}

export async function savePlaylist() {
	const path = get(playlistPath);
	console.log("Save to path:", path);

	// Create object with version and playlist
	const saveObj: SaveFile = {
		meta: {
			version: await getVersion(),
		},
		playlist: JSON.parse(JSON.stringify(get(playlist))),
		hotkeys: [],
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
	writeTextFile(`${path}/playlist.Stagetune`, JSON.stringify(saveObj), {});
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
					dir: BaseDirectory.Config,
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
			dir: BaseDirectory.Config,
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
			dir: BaseDirectory.Config,
		}).then(e => {
			if (e) {
				loadSettings(true);
			} else {
				createDir(`Stagetune/${currentVersion}`, {
					dir: BaseDirectory.Config,
					recursive: true,
				});
				saveSettings();
			}
		});
	});
}
