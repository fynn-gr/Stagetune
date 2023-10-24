import { writable } from "svelte/store";

export const settings = writable({
	recent: [],
	lang: "en",
	show_splash: true,
	ui_scale: 1.3,
	performance_mode: false,
});

export const currentDragging = writable(null);
export const editMode = writable(true);
export const uiPlatform = writable("win");
export const playlist = writable([
	/*
	{
		type: "loop",
		name: "Einlass",
		tracks: [
			{
				type: "track",
				origin: "playlist",
				path: "/Volumes/T7/Files extern/Alte Schule/Musik/Test/sus.mp3",
				name: "3",
				playing: false,
				state: 0,
				fade: [0, 0],
				edit: [0, 0],
				annotation: [null, null]
			},
			{
				type: "track",
				origin: "playlist",
				path: "/Volumes/T7/Files extern/Alte Schule/Musik/Test/sus.mp3",
				name: "4",
				playing: false,
				state: 0,
				fade: [0, 0],
				edit: [0, 0],
				annotation: [null, null]
			},
			{
				type: "track",
				origin: "playlist",
				path: "/Volumes/T7/Files extern/Alte Schule/Musik/Test/sus.mp3",
				name: "4",
				playing: false,
				state: 0,
				fade: [0, 0],
				edit: [0, 0],
				annotation: [null, null]
			},
		]
	}
	*/
]);
export const selectedItem = writable(null);
export const hotkeys = writable([
	{
		key: "1",
		track: null,
	},
	{
		key: "2",
		track: null,
	},
	{
		key: "3",
		track: null,
	},
	{
		key: "4",
		track: null,
	},
	{
		key: "5",
		track: null,
	},
	{
		key: "6",
		track: null,
	},
	{
		key: "7",
		track: null,
	},
	{
		key: "8",
		track: null,
	},
	{
		key: "9",
		track: null,
	},
]);
export const hotkeyElements = writable([]);
export const playlistElements = writable([]);

export const srcFiles = writable([]);
export const localFiles = writable([
	{
		name: "cutscene 1",
		path: "/videos/Cutscene 1.mp4",
		type: "video",
		origin: "src",
	},
	{
		name: "cutscene 2",
		path: "/videos/Cutscene 2.mp4",
		type: "video",
		origin: "src",
	},
	{
		name: "cutscene 3",
		path: "/videos/Cutscene 3.mp4",
		type: "video",
		origin: "src",
	},
	{
		name: "cutscene 4",
		path: "/videos/Cutscene 4.mp4",
		type: "video",
		origin: "src",
	},
	{
		name: "cutscene 5",
		path: "/videos/Cutscene 5.mp4",
		type: "video",
		origin: "src",
	},
	{
		name: "cutscene 6",
		path: "/videos/Cutscene 6.mp4",
		type: "video",
		origin: "src",
	},
	{
		name: "cutscene 7",
		path: "/videos/Cutscene 7.mp4",
		type: "video",
		origin: "src",
	},
	{
		name: "cutscene 8",
		path: "/videos/Cutscene 8.mp4",
		type: "video",
		origin: "src",
	},
	{
		name: "cutscene 9",
		path: "/videos/Cutscene 9.mp4",
		type: "video",
		origin: "src",
	},
]);
export const playlistPath = writable("");
export const isEditing = writable(0);
