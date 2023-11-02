import { writable } from "svelte/store";

export const settings = writable({
	recent: [],
	lang: "en",
	show_splash: true,
	ui_scale: 1.3,
	performance_mode: false,
	keymap: [
		{
			operator: "play_pause",
			name: "Play/Pause",
			key: "Spacebar",
			ctrl: false,
			alt: false,
			meta: false,
		},
		{
			operator: "up",
			name: "Playlist up",
			key: "KeyW",
			ctrl: false,
			alt: false,
			meta: false,
		},
		{
			operator: "up",
			name: "Playlist up",
			key: "arrowUp",
			ctrl: false,
			alt: false,
			meta: false,
		},
		{
			operator: "down",
			name: "Playlist down",
			key: "KeyS",
			ctrl: false,
			alt: false,
			meta: false,
		},
		{
			operator: "down",
			name: "Playlist down",
			key: "arrowDown",
			ctrl: false,
			alt: false,
			meta: false,
		},
		{
			operator: "reset",
			name: "Reset Song",
			key: "KeyA",
			ctrl: false,
			alt: false,
			meta: false,
		},
		{
			operator: "reset",
			name: "Reset Song",
			key: "arrowLeft",
			ctrl: false,
			alt: false,
			meta: false,
		},
		{
			operator: "skip",
			name: "Skip song",
			key: "KeyD",
			ctrl: false,
			alt: false,
			meta: false,
		},
		{
			operator: "skip",
			name: "Skip song",
			key: "arrowRight",
			ctrl: false,
			alt: false,
			meta: false,
		},

		{
			operator: "hotkey1",
			name: "Hotkey 1",
			key: "Digit1",
			ctrl: false,
			alt: false,
			meta: false,
		},
		{
			operator: "hotkey2",
			name: "Hotkey 2",
			key: "Digit2",
			ctrl: false,
			alt: false,
			meta: false,
		},
		{
			operator: "hotkey3",
			name: "Hotkey 3",
			key: "Digit3",
			ctrl: false,
			alt: false,
			meta: false,
		},
		{
			operator: "hotkey4",
			name: "Hotkey 4",
			key: "Digit4",
			ctrl: false,
			alt: false,
			meta: false,
		},
		{
			operator: "hotkey5",
			name: "Hotkey 5",
			key: "Digit5",
			ctrl: false,
			alt: false,
			meta: false,
		},
		{
			operator: "hotkey6",
			name: "Hotkey 6",
			key: "Digit6",
			ctrl: false,
			alt: false,
			meta: false,
		},
		{
			operator: "hotkey7",
			name: "Hotkey 7",
			key: "Digit7",
			ctrl: false,
			alt: false,
			meta: false,
		},
		{
			operator: "hotkey8",
			name: "Hotkey 8",
			key: "Digit8",
			ctrl: false,
			alt: false,
			meta: false,
		},
		{
			operator: "hotkey9",
			name: "Hotkey 9",
			key: "Digit9",
			ctrl: false,
			alt: false,
			meta: false,
		},

		{
			operator: "hotkey1_clear",
			name: "Clear Hotkey 1",
			key: "Digit1",
			ctrl: false,
			alt: true,
			meta: false,
		},
		{
			operator: "hotkey2_clear",
			name: "Clear Hotkey 2",
			key: "Digit2",
			ctrl: false,
			alt: true,
			meta: false,
		},
		{
			operator: "hotkey3_clear",
			name: "Clear Hotkey 3",
			key: "Digit3",
			ctrl: false,
			alt: true,
			meta: false,
		},
		{
			operator: "hotkey4_clear",
			name: "Clear Hotkey 4",
			key: "Digit4",
			ctrl: false,
			alt: true,
			meta: false,
		},
		{
			operator: "hotkey5_clear",
			name: "Clear Hotkey 5",
			key: "Digit5",
			ctrl: false,
			alt: true,
			meta: false,
		},
		{
			operator: "hotkey6_clear",
			name: "Clear Hotkey 6",
			key: "Digit6",
			ctrl: false,
			alt: true,
			meta: false,
		},
		{
			operator: "hotkey7_clear",
			name: "Clear Hotkey 7",
			key: "Digit7",
			ctrl: false,
			alt: true,
			meta: false,
		},
		{
			operator: "hotkey8_clear",
			name: "Clear Hotkey 8",
			key: "Digit8",
			ctrl: false,
			alt: true,
			meta: false,
		},
		{
			operator: "hotkey9_clear",
			name: "Clear Hotkey 9",
			key: "Digit9",
			ctrl: false,
			alt: true,
			meta: false,
		},

		{
			operator: "projector",
			name: "Projector",
			key: "Spacebar",
			ctrl: true,
			alt: false,
			meta: false,
		},
		{
			operator: "settings",
			name: "Settings",
			key: "Comma",
			ctrl: true,
			alt: false,
			meta: false,
		},
		{
			operator: "save",
			name: "Save Playlist",
			key: "KeyS",
			ctrl: true,
			alt: false,
			meta: false,
		},
		{
			operator: "open",
			name: "Open Directory",
			key: "KeyO",
			ctrl: true,
			alt: false,
			meta: false,
		},
	],
	video: false,
});
export const contextMenu = writable(null);
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
export const selectedAnnotation = writable(false);
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
