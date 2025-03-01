export interface PlaylistElement {
	play(startTime?: number, useFade?: boolean): void;
	stop(reset?: boolean, useFade?: boolean);
	playPause(): void;
	update(): void;
	getBuffer();
}
