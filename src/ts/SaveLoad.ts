//Tauri
import { open } from "@tauri-apps/plugin-dialog";
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
import { isAudioFile, isVideoFile, isPlaylistFile } from "./FileUtils";
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

export async function openDir() {
	try {
		const sel = await open({
			directory: true,
			multiple: false,
		});

		if (!sel) return;

		scanSrcPaths(sel as string);
		playlistPath.set(sel as string);

	} catch (err) {
		console.error(err);
	}
}

export async function scanSrcPaths(selPath: string) {
	try {
		let playlistFile: string;

		// Recursive scan of src path
		async function processDirRecursive(path: string) {
			const entries = await readDir(path);
			console.log(entries);

			//loop over entries
			entries.forEach(async (entry: DirEntry) => {
				if (entry.isDirectory) {
					// Subfolder
					processDirRecursive(await join(selPath, entry.name));
				} else if (isAudioFile(entry.name)) {
					// Audio File
					const modifiedPath = await basename(entry.name);
					const obj = {
						type: "track",
						name: entry.name.replace(/\.[^.]+$/gm, ""),
						path: modifiedPath,
					};
					srcFiles.update(items => {
						items.push(obj);
						return items;
					});
				} else if (isVideoFile(entry.name)) {
					// Video File
					const modifiedPath = await basename(entry.name);
					const obj = {
						type: "video",
						name: entry.name.replace(/\.[^.]+$/gm, ""),
						path: modifiedPath,
					};
					srcFiles.update(items => {
						items.push(obj);
						return items;
					});
				} else if (isPlaylistFile(entry.name)) {
					// Playlist File
					playlistFile = entry.name;
					console.log(playlistFile);
					readTextFile(await join(selPath, playlistFile), {}).then(e => {
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
		}

		processDirRecursive(selPath)
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
