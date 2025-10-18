import type { MouseEventHandler } from "svelte/elements";

export type ItemType = "track" | "video" | "image" | "annotation" | "loop";

export type PlaylistTrack = {
	type: "track"; // type of item
	path: string; //relative path
	pathSource: string; // absolute path of the folder
	name: string; //title of the item
	length: number; //track duration
	playing: boolean; //is currently playing
	timeCode: number; //seconds playhead is at, not including cut In
	volume: number; //sound volume, deafult is 80 out of 100
	pan: number; //stereo pan -1 to 1
	repeat: boolean; //repeat track option is on
	autoReset: boolean; //auto reset after pause option is on
	edit: { in: number; out: number }; //cut second at beginning and end (only beginning is implemented)
	fade: { in: number; out: number }; //sedonds to fade in and out
	annotation: { text: string; color: string | null } | null; //annotation text and color, if the item is an annotation, this is also the prop used
	buffer: AudioBuffer | null; //audio buffer
	startedAt: number; //track was started at seconds
	pausedAt: number; // track was paused at seconds
	inFade: "in" | "out" | null; //track is currently in fade or null
	hotkey: number | null; //hotkey number assigned, null if not assigned
	missing: boolean; //true if file could not be found
	loaded: boolean; //if track finished loading
	state?: number; // Current playback state
};

export type PlaylistVideo = {
	type: "video"; // type of item
	path: string; //relative path
	pathSource: string; // absolute path of the folder
	name: string; //title of the item
	length: number; //track duration
	playing: boolean; //is currently playing
	timeCode: number; //seconds playhead is at, not including cut In
	annotation: { text: string; color: string | null } | null; //annotation text and color, if the item is an annotation, this is also the prop used
	startedAt: number; //track was started at seconds
	pausedAt: number; // track was paused at seconds
	missing: boolean; //true if file could not be found
	loaded: boolean; //if track finished loading
	state?: number; // Current playback state
	edit?: { in: number; out: number }; // For compatibility with editor
};

export type PlaylistAnnotation = {
	type: "annotation"; // type of item
	annotation: { text: string; color: string | null }; //annotation text and color, if the item is an annotation, this is also the prop used
	state?: number; // For compatibility
	length?: number; // For compatibility
	edit?: { in: number; out: number }; // For compatibility with editor
};

export type PlaylistImage = {
	type: "image"; // type of item
	path: string; //relative path
	pathSource: string; // absolute path of the folder
	name: string; //title of the item
	playing: boolean; //is currently playing
	timeCode: number; //seconds playhead is at, not including cut In
	missing: boolean; //true if file could not be found
	loaded: boolean; //if track finished loading
	state?: number; // For compatibility
	length?: number; // For compatibility
	edit?: { in: number; out: number }; // For compatibility with editor
	annotation?: { text: string; color: string | null } | null; // For compatibility
};

export type PlaylistLoop = {
	type: "loop"; // type of item
	name?: string; //title of the item
	playing?: boolean; //is currently playing
	timeCode?: number; //seconds playhead is at, not including cut In
	volume?: number; //sound volume, deafult is 80 out of 100
	pan?: number; //stereo pan -1 to 1
	annotation: { text: string; color: string | null } | null; //annotation text and color, if the item is an annotation, this is also the prop used
	items?: Array<{ type: string; path: string; pathSource: string }>; //Loop items
	state?: number; // For compatibility
	length?: number; // For compatibility
	edit?: { in: number; out: number }; // For compatibility with editor
};

export type SaveFile = {
	meta: {
		version: string;
	};
	playlist: Array<
		| PlaylistTrack
		| PlaylistVideo
		| PlaylistAnnotation
		| PlaylistImage
		| PlaylistLoop
	>;
	hotkeys: Hotkey[];
	srcFiles: SrcDirectory[];
};

export type SrcDirectory = {
	path: string;
	files: Array<Object>;
};

export type Hotkey = {
	key: number;
	track: PlaylistTrack | null;
};

export type videoListElement = {
	type: "video" | "image";
	name: string;
	url: string;
};

//temp Operator declaration till Operators are implemented in UI
export type Operator = {
	operator: string;
	name: string;
	key: string;
	ctrl: boolean;
	alt: boolean;
	meta: boolean;
};

export type ContextMenu = {
	position: { x: number; y: number };
	content: {
		name: string;
		icon: string;
		iconColor: boolean;
		action: MouseEventHandler<HTMLButtonElement>;
		accelerator?: string;
	}[];
};
