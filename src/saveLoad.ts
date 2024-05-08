import { open } from "@tauri-apps/api/dialog";
import { get } from "svelte/store";
import {
	BaseDirectory,
	createDir,
	exists,
	readDir,
	readTextFile,
	writeTextFile,
} from "@tauri-apps/api/fs";
import { isAudioFile, isVideoFile, isPlaylistFile } from "./utils";
import {
	playlist,
	playlistPath,
	srcFiles,
	hotkeys,
	settings,
	uiPlatform,
	splash,
} from "./stores";
import { getVersion } from "@tauri-apps/api/app";
import { basename } from "@tauri-apps/api/path";
import { emit } from "@tauri-apps/api/event";

export function openDir() {
	try {
		open({
			directory: true,
			multiple: false,
		}).then(async sel => {
			if (sel == null) {
			} else {
				//add to src paths
				scanSrcPaths(sel as string);
				playlistPath.set(sel as string);

				//add to recent
				settings.update(e => {
					e.recent.push(sel);
					return e;
				});
				saveSettings();
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
		entries.forEach(async (entry, j) => {
			//console.log(`File: `, entry.path);
			if (entry.children) {
				//subfolder
				processEntries(entry.children);
			} else if (isAudioFile(entry.path)) {
				//Audio File
				entry.type = "track";
				entry.origin = "src";
				entry.name = entry.name.replace(/\.[^.]+$/gm, "");
				let modifiedPath = await basename(entry.path);
				console.log(modifiedPath);
				entry.path = modifiedPath;
				srcFiles.update(items => {
					items.push(entry);
					return items;
				});
			} else if (isVideoFile(entry.path)) {
				//Video File
				/*entry.type = "video";
				entry.origin = "src";
				entry.name = entry.name.replace(/\.[^.]+$/gm, "");
				srcFiles.update(items => {
					items.push(entry);
					return items;
				})*/
			} else if (isPlaylistFile(entry.path)) {
				//is Playlist
				playlistFile = entry.path;
				readTextFile(playlistFile, {}).then(e => {
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
			} else {
			}
		});

		//sort alphabetically
		srcFiles.update(items => {
			items.sort(function (a, b) {
				if (a.name < b.name) {
					return -1;
				}
				if (a.name > b.name) {
					return 1;
				}
				return 0;
			});
			//console.log(get(srcFiles))
			return items;
		});
	}
	processEntries(await entries);
}

export async function savePlaylist() {
	//save to known path
	console.log("save to path: ", get(playlistPath));

	let saveObj = {
		meta: {
			version: await getVersion(),
		},
		playlist: JSON.parse(JSON.stringify(get(playlist))),
		hotkeys: [],
	};

	saveObj.playlist.forEach(e => {
		e.playing = false;
		e.state = 0;
		e.startedAt = 0;
		e.pausedAt = 0;
		e.inFade = null;
		e.buffer = null;
	});

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

	writeTextFile(
		get(playlistPath) + "/playlist.Stagetune",
		JSON.stringify(saveObj),
		{}
	);
}

export function saveSettings() {
	let currentVersion;
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
				}
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
			console.log("ui sclae. ", get(settings).ui_scale);
			document.documentElement.style = `font-size: ${get(settings).ui_scale}px`;
		});
	});
}

export function checkSettingsExist() {
	let currentVersion;
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
