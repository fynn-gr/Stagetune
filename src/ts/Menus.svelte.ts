import {
	IconMenuItem,
	Menu,
	MenuItem,
	PredefinedMenuItem,
	type AboutMetadata,
} from "@tauri-apps/api/menu";
import { Submenu } from "@tauri-apps/api/menu/submenu";
import { recent } from "./Stores.svelte";
import { get } from "svelte/store";
import { fileNameFromPath } from "./FileUtils";

export async function createNativeMenu() {
	let menu;
	let subMain: Submenu;
	let subFile: Submenu;
	let subEdit: Submenu;
	let subWindow: Submenu;
	let subHelp: Submenu;

	let recentItems: Array<MenuItem | PredefinedMenuItem> = [];
	get(recent).forEach(async (e) => {
		recentItems.push(
			await MenuItem.new({
				id: e,
				text: e,
			}),
		);
	});
	recentItems.push(await PredefinedMenuItem.new({ item: "Separator" }));
	recentItems.push(
		await MenuItem.new({ id: "clearRecent", text: "Clear Menu" }),
	);

	// Menu bar
	async function createSubmenu() {
		// App
		let meta: AboutMetadata = { license: "GPL 3.0", authors: ["Fyn Gr."] };
		let about = await PredefinedMenuItem.new({
			item: { About: { license: "GPL 3.0", authors: ["Fyn Gr."] } },
			text: "About Stagetune",
		});
		let sep = await PredefinedMenuItem.new({ item: "Separator" });
		let settings = await MenuItem.new({
			id: "settings",
			text: "Settings",
			accelerator: "cmd+,",
		});
		let services = await PredefinedMenuItem.new({ item: "Services" });
		let hide = await PredefinedMenuItem.new({ item: "Hide" });
		let hideOthers = await PredefinedMenuItem.new({ item: "HideOthers" });
		let showAll = await PredefinedMenuItem.new({ item: "ShowAll" });
		let quit = await MenuItem.new({
			id: "quit",
			text: "Quit",
			accelerator: "cmd+Q",
		});

		subMain = await Submenu.new({
			text: "app",
			items: [
				about,
				sep,
				settings,
				sep,
				services,
				sep,
				hide,
				hideOthers,
				showAll,
				sep,
				quit,
			],
		});

		// File
		let newPlaylist = await MenuItem.new({
			id: "newPlaylist",
			text: "New",
		});
		let openPlaylist = await MenuItem.new({
			id: "openPlaylist",
			text: "Open",
			accelerator: "cmd+O",
		});
		let save = await MenuItem.new({
			id: "save",
			text: "Save",
			accelerator: "cmd+S",
		});
		let saveAs = await MenuItem.new({
			id: "saveAs",
			text: "Save As",
			accelerator: "cmd+S",
		});
		let recent = await Submenu.new({
			text: "Open Recent",
			items: recentItems,
		});
		let addSource = await MenuItem.new({
			id: "addSource",
			text: "Add Source",
		});

		subFile = await Submenu.new({
			text: "File",
			items: [
				newPlaylist,
				openPlaylist,
				recent,
				sep,
				save,
				saveAs,
				sep,
				addSource,
			],
		});

		// Edit
		let undo = await PredefinedMenuItem.new({ item: "Undo" });
		let redo = await PredefinedMenuItem.new({ item: "Redo" });

		subEdit = await Submenu.new({
			text: "Edit",
			items: [undo, redo],
		});

		//Window
		let min = await PredefinedMenuItem.new({ item: "Minimize" });
		let max = await PredefinedMenuItem.new({ item: "Maximize" });
		let showTracklist = await MenuItem.new({
			id: "showTracklist",
			text: "Tracklist",
		});
		let showCurrent = await MenuItem.new({
			id: "showCurrent",
			text: "Current",
		});
		let showHotkeys = await MenuItem.new({
			id: "showHotkeys",
			text: "Hotkeys",
		});
		let showEditor = await MenuItem.new({ id: "showEditor", text: "Editor" });
		let projector = await MenuItem.new({ id: "projector", text: "Projector" });

		subWindow = await Submenu.new({
			text: "Window",
			items: [
				min,
				max,
				sep,
				showTracklist,
				showCurrent,
				showHotkeys,
				showEditor,
				sep,
				projector,
			],
		});
	}

	async function createMenu() {
		await createSubmenu();
		menu = await Menu.new({
			items: [subMain, subFile, subEdit, subWindow],
		});
		await menu.setAsAppMenu();
	}

	createMenu();
}
