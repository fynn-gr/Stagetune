import { writable } from "svelte/store";

export const currentDragging = writable(null);
export const editMode = writable(true);
export const uiPlatform = writable("mac");
export const playlist = writable([
	//text
	//playing
	//path
	//title
	//length
	//state
	//volume
	//pan
	//repeat
	//edit [cutIn, cutOut, fadeIn, fadeOut]
	//annotation [before, after]
	//title
	//tracks
	/*
    {
        title: "Einlass",
        tracks: [
            {
                title: "A Day To Remember",
                path: "D:/Alte Schule/Messias/Messias Musik/A Day To Remember - Mr. Highway's Thinking About The End.mp3",
                length: "2:55",
                annotation: ["wenn Hirten auf","wenn Hireten ab, Komet runter, licht auf Hitern wechseln und Bla bla bla warten bis etwas passiert was soll das hier"]
            },
            {
                path: "D:/Alte Schule/Messias/Messias Musik/Der Messias 42. Chor  Halleluja.mp3",
                length: "2:30",
                annotation: ["", ""]
            },
            {
                path: "D:/Alte Schule/Messias/Messias Musik/A Day To Remember - Mr. Highway's Thinking About The End.mp3",
                length: "3:10",
                annotation: ["wenn Hirten auf", ""]
            }
        ]
    }*/
]);
export const selectedItem = writable(null);
export const srcPaths = writable([]);
export const srcFiles = writable([]);
export const playlistPath = writable("");
export const isEditing = writable(0);
export const hotkeys = writable([
	{
		title: "A Day To Remember",
		path: "D:/Alte Schule/Messias/Messias Musik/A Day To Remember - Mr. Highway's Thinking About The End.mp3",
		length: "2:55",
		selected: true,
		annotation: [
			"wenn Hirten auf",
			"wenn Hireten ab, Komet runter, licht auf Hitern wechseln und Bla bla bla warten bis etwas passiert was soll das hier",
		],
	},
	{
		title: "Glocke",
		path: "D:/Alte Schule/Messias/Messias Musik/A Day To Remember - Mr. Highway's Thinking About The End.mp3",
		length: "2:55",
		selected: true,
		annotation: [
			"wenn Hirten auf",
			"wenn Hireten ab, Komet runter, licht auf Hitern wechseln und Bla bla bla warten bis etwas passiert was soll das hier",
		],
	},
]);