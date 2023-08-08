import { writable } from "svelte/store";

export const currentDragging = writable(null);
export const editMode = writable(true);
export const uiPlatform = writable("mac");
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
		type: "track",
		name: "",
		path: "",
		playing: false,
	},
	{
		key: "2",
		type: "track",
		name: "",
		path: "",
		playing: false,
	},
	{
		key: "3",
		type: "track",
		name: "",
		path: "",
		playing: false,
	},
	{
		key: "4",
		type: "track",
		name: "",
		path: "",
		playing: false,
	},
	{
		key: "5",
		type: "track",
		name: "",
		path: "",
		playing: false,
	},
	{
		key: "6",
		type: "track",
		name: "",
		path: "",
		playing: false,
	},
	{
		key: "7",
		type: "track",
		name: "",
		path: "",
		playing: false,
	},
	{
		key: "8",
		type: "track",
		name: "",
		path: "",
		playing: false,
	},
	{
		key: "9",
		type: "track",
		name: "",
		path: "",
		playing: false,
	},
	{
		key: "0",
		type: "track",
		name: "",
		path: "",
		playing: false,
	},
]);

export const srcPaths = writable([]);
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
		path: "/videos/Cutscene 2mp4",
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
export const recent = writable([]);
export const isEditing = writable(0);
