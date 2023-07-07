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
    if (filename.match(/\.(playlist)$/)) {
        return true;
    } else {
        return false;
    }
}

export function secondsToMinutes(inp: number) {
    let mins = ~~((inp % 3600) / 60)
    let secs = ~~inp - mins * 60;
    let secsFormat = secs < 10 ? "0" + secs : "" + secs;
    return `${mins}:${secsFormat}`;
}