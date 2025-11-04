import { readable, writable } from "svelte/store";
import type {
	ContextMenu,
	Hotkey,
	PlaylistAnnotation,
	PlaylistImage,
	PlaylistLoop,
	PlaylistTrack,
	PlaylistVideo,
	SrcDirectory,
} from "./Types";
import { emit } from "@tauri-apps/api/event";
import type { Monitor } from "@tauri-apps/api/window";
import type { PlaylistElement } from "@/lib/Components";
import { settingsDefault, type Settings } from "./SettingsDefault";

export const settings = writable<Settings>(settingsDefault);
export const showProjector = writable<boolean>(false);
export const recent = writable<Array<string>>([]);

// screens for projector
export const projector: {
	screens: Array<Monitor>;
	selectedScreen: number;
	mainScreenID: number;
} = $state({
	screens: [],
	selectedScreen: 0,
	mainScreenID: 0,
});

// context menu content
export const contextMenu = writable<ContextMenu | null>(null);

// dargging of items
export const currentDragging = writable<
	| PlaylistTrack
	| PlaylistVideo
	| PlaylistAnnotation
	| PlaylistImage
	| PlaylistLoop
	| null
>(null); //dragging object
export const draggingOrigin = writable<"src" | "playlist" | null>(null);

export const editMode = writable<boolean>(true);
export const uiPlatform = writable<"mac" | "win">("win");
export const theme = writable("dark"); //unused, just for compatibility with pure UI
export const splash = writable<boolean>(false); //splash screen visible

export const selectedItem = writable<number | undefined>(undefined);
export const playlist: Array<
	| PlaylistTrack
	| PlaylistVideo
	| PlaylistAnnotation
	| PlaylistImage
	| PlaylistLoop
> = $state([]);
export const playlistZoom = writable<number>(72);

export const hotkeys: Array<Hotkey> = $state([
	{
		key: 1,
		track: null,
	},
	{
		key: 2,
		track: null,
	},
	{
		key: 3,
		track: null,
	},
	{
		key: 4,
		track: null,
	},
	{
		key: 5,
		track: null,
	},
	{
		key: 6,
		track: null,
	},
	{
		key: 7,
		track: null,
	},
	{
		key: 8,
		track: null,
	},
	{
		key: 9,
		track: null,
	},
]);
export const playlistElements: Array<PlaylistElement> = $state([]);
export const hotkeyElements: Array<any> = $state([]);

export const srcFiles = writable<SrcDirectory[]>([]); // media Files
export const playlistPath = writable<string>(""); // playlist save path

export const isEditing = writable<number>(0); //input currently in focus counter
export const menuHandler = readable({
	handle(id: string) {
		emit("menu", id);
	},
});
