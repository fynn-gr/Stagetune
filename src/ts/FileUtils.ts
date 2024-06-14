export function isAudioFile(filename: string): boolean {
	return /\.(mp3|ogg|aac|flac|wav|m4a)$/.test(filename);
}

export function isVideoFile(filename: string): boolean {
	return /\.(mp4|mov|mkv|m4v|mpg|avi|webm)$/.test(filename);
}

export function isPlaylistFile(filename: string): boolean {
	return /\.(Stagetune)$/.test(filename);
}

export function fileNameFromPath(filepath: string): string {
	const filename = filepath.split(/[\\/]/).pop(); // Get the last segment after splitting by slash or backslash
	return filename ? filename : ""; // Return filename if found, otherwise empty string
}
