export function isAudioFile(filename: string): boolean {
    if (filename.match(/\.(mp3|ogg|aac|flac|wav|m4a)$/)) {
        return true;
    } else {
        return false;
    }
}