import type { MouseEventHandler } from "svelte/elements";

export type ItemType = "track" | "video" | "annotation";

export type PlaylistItem = {
	type: ItemType; // type of item
	path?: string; //relative path
	name?: string; //title of the item
	length?: number; //track duration
	playing?: boolean; //is currently playing
	state?: number; //seconds playhead is at, not including cut In
	volume?: number; //sound volume, deafult is 80 out of 100
	pan?: number; //stereo pan -1 to 1
	repeat?: boolean; //repeat track option is on
	autoReset?: boolean; //auto reset after pause option is on
	edit?: { in: number; out: number }; //cut second at beginning and end (only beginning is implemented)
	fade?: { in: number; out: number }; //sedonds to fade in and out
	annotation: { text: string; color: string | null } | null; //annotation text and color, if the item is an annotation, this is also the prop used
	buffer?: AudioBuffer; //audio buffer
	startedAt?: number; //track was started at seconds
	pausedAt?: number; // track was paused at seconds
	inFade?: "in" | "out" | null; //track is currently in fade or null
	hotkey?: number | null; //hotkey number assigned, null if not assigned
	missing?: boolean; //true if file could not be found
	loaded?: boolean; //if track finished loading
};

export type Settings = {
	recent: Array<string>;
	lang: string;
	show_splash: boolean;
	ui_scale: number;
	performance_mode: boolean;
	projector_screen: any;
	debug: boolean;
	video: boolean;

	showAnnotations: boolean;
	showFadeOptions: boolean;
	showVolumeOptions: boolean;
	allowSkipLive: boolean;
};

export type SaveFile = {
	meta: {
		version: string;
	};
	playlist: PlaylistItem[];
	hotkeys: Hotkey[];
};

export type Hotkey = {
	key: number;
	track: PlaylistItem | null;
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
