import type PlayListAnotation from "@/lib/PlayListAnotation.svelte";
import type PlayListVideo from "@/lib/PlayListVideo.svelte";
import type { MouseEventHandler } from "svelte/elements";

export type playListTrack = {
	path: string; //relative path
	name: string; //title of the item
	length: number; //track duration
	playing: boolean; //is currently playing
	state: number; //seconds playhead is at, not including cut In
	volume: number; //sound volume, deafult is 80 out of 100
	pan: number; //stereo pan -1 to 1
	repeat: boolean; //repeat track option is on
	autoReset: boolean; //auto reset after pause option is on
	edit: { in: number; out: number }; //cut second at beginning and end (only beginning is implemented)
	fade: { in: number; out: number }; //sedonds to fade in and out
	annotation: { text: string; color: string } | null; //annotation text and color, if the item is an annotation, this is also the prop used
	buffer: AudioBuffer | undefined; //audio buffer
	startedAt: number; //track was started at seconds
	pausedAt: number; // track was paused at seconds
	inFade: "in" | "out" | null; //track is currently in fade or undefined
	hotkey: number | null; //hotkey number assigned, undefined if not assigned
	missing: boolean; //true if file could not be found
	loaded: boolean; //if track finished loading
};

export type playListVideo = {
	path?: string; //relative path
	name?: string; //title of the item
	length?: number; //track duration
	playing?: boolean; //is currently playing
	state?: number; //seconds playhead is at, not including cut In
	volume?: number; //sound volume, deafult is 80 out of 100
	pan?: number; //stereo pan -1 to 1
	repeat?: boolean; //repeat track option is on
	autoReset: boolean; //auto reset after pause option is on
	annotation?: { text: string; color: string }; //annotation text and color, if the item is an annotation, this is also the prop used
	startedAt?: number; //track was started at seconds
	pausedAt?: number; // track was paused at seconds
	inFade?: "in" | "out"; //track is currently in fade or undefined
	hotkey?: number; //hotkey number assigned, undefined if not assigned
	missing: boolean; //true if file could not be found
	loaded: boolean; //if track finished loading
};

export type playListAnnotiation = {
	annotation?: { text: string; color: string }; //annotation text and color, if the item is an annotation, this is also the prop used
};

export type Settings = {
	recent: Array<string>;
	lang: string;
	show_splash: boolean;
	ui_scale: number;
	performance_mode: boolean;
	debug: boolean;
	video: boolean;

	showAnnotations: boolean;
	showFadeOptions: boolean;
	showVolumeOptions: boolean;
	allowSkipLive: boolean;
};

export type Hotkey = {
	key: number;
	track: playListTrack | PlayListVideo | PlayListAnotation | null;
};

//temp Operator declaration till Operators are implemented in UI
export type Operator = {
	operator: string;
	name: string;
	key: string;
	ctrl: boolean;
	alt: boolean;
	meta: boolean;
}

export type ContextMenu = {
	position: { x: number, y: number };
	content: {
		name: string;
		icon: string;
		iconColor: boolean;
		action: MouseEventHandler<HTMLButtonElement>;
		accelerator?: string;
	}[]
}