export type playListItem = {
	type: string; //track, video, annotation
	path?: string; //relative path
	name?: string; //title of the item
	length?: number; //track duration
	playing?: boolean; //is currently playing
	state?: number; //seconds playhead is at, not including cut In
	volume?: number; //sound volume, deafult is 80 out of 100
	pan?: number; //stereo pan -1 to 1
	repeat?: boolean; //repeat track option is on
	autoReset: boolean; //auto reset after pause option is on
	edit?: { in?: number; out?: number }; //cut second at beginning and end (only beginning is implemented)
	fade?: { in?: number; out?: number }; //sedonds to fade in and out
	annotation?: { text: string; color: string }; //annotation text and color, if the item is an annotation, this is also the prop used
	buffer?: AudioBuffer; //audio buffer location
	startedAt?: number; //track was started at seconds
	pausedAt?: number; // track was paused at seconds
	inFade?: "in" | "out"; //track is currently in fade or undefined
	hotkey?: string; //hotkey number assigned, undefined if not assigned
	missing: boolean; //true if file could not be found
	loaded: boolean; //if track finished loading
}