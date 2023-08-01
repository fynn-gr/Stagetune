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
		playing: false
	},
	{
		key: "2",
		type: "track",
		name: "",
		path: "",
		playing: false
	},
	{
		key: "3",
		type: "track",
		name: "",
		path: "",
		playing: false
	},
	{
		key: "4",
		type: "track",
		name: "",
		path: "",
		playing: false
	},
	{
		key: "5",
		type: "track",
		name: "",
		path: "",
		playing: false
	},
	{
		key: "6",
		type: "track",
		name: "",
		path: "",
		playing: false
	},
	{
		key: "7",
		type: "track",
		name: "",
		path: "",
		playing: false
	},
	{
		key: "8",
		type: "track",
		name: "",
		path: "",
		playing: false
	},
	{
		key: "9",
		type: "track",
		name: "",
		path: "",
		playing: false
	},
	{
		key: "0",
		type: "track",
		name: "",
		path: "",
		playing: false
	},
]);

export const srcPaths = writable([]);
export const srcFiles = writable([]);
export const playlistPath = writable("");
export const isEditing = writable(0);
