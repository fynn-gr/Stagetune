export function isAudioFile(filename: string): boolean {
	if (filename.match(/\.(mp3|ogg|aac|flac|wav|m4a)$/)) {
		return true;
	} else {
		return false;
	}
}

export function isVideoFile(filename: string): boolean {
	if (filename.match(/\.(mp4|mov|mkv|m4v|mpg|avi|webm)$/)) {
		return true;
	} else {
		return false;
	}
}

export function isPlaylistFile(filename: string): boolean {
	if (filename.match(/\.(Stagetune)$/)) {
		return true;
	} else {
		return false;
	}
}

export function fileNameFromPath(filename: string) {
	let str = filename.substring(filename.lastIndexOf("\\") + 1);
	return str.substring(str.lastIndexOf("/") + 1);
}
