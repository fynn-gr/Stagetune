#![cfg_attr(
		all(not(debug_assertions), target_os = "windows"),
		windows_subsystem = "windows"
)]

use tauri::{Manager, CustomMenuItem, Menu, MenuItem, Submenu, AboutMetadata, MenuEntry};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[tauri::command]
async fn show_projector(handle: tauri::AppHandle, invoke_message: String) {
	if invoke_message == "true" {
		let video_window = tauri::WindowBuilder::new(
			&handle,
			"video_window", /* the unique window label */
			tauri::WindowUrl::App("video.html".into())
		)
		.build()
		.unwrap();

		video_window.set_always_on_top(true);
		video_window.set_decorations(false);
	} else {
		let window = handle.get_window("video_window").unwrap();
		window.close();
	}

}


fn main() {
	let context = tauri::generate_context!();

	let submenu = Submenu::new("Main", Menu::new()
	.add_native_item(MenuItem::About(context.package_info().name.clone(), AboutMetadata::default()).into())
	.add_native_item(MenuItem::Separator)
	.add_native_item(MenuItem::Services)
	.add_native_item(MenuItem::Separator)
	.add_native_item(MenuItem::Hide)
	.add_native_item(MenuItem::HideOthers)
	.add_native_item(MenuItem::ShowAll)
	.add_native_item(MenuItem::Separator)
	.add_item(CustomMenuItem::new("quit".to_string(), "Quit").accelerator("cmd+Q")));
	let menu = Menu::new()
		.add_submenu(submenu)
		.add_submenu(Submenu::new("File", Menu::new()
			.add_item(CustomMenuItem::new("new", "New Playlist").accelerator("cmd+N"))
			.add_item(CustomMenuItem::new("open", "Open").accelerator("cmd+O"))
			.add_item(CustomMenuItem::new("save", "Save").accelerator("cmd+S"))
			.add_item(CustomMenuItem::new("save_as", "Save As").accelerator("cmd+shift+S"))
			.add_native_item(MenuItem::Separator)
			.add_item(CustomMenuItem::new("add", "Add Soure").accelerator("cmd+A"))))
		.add_submenu(Submenu::new("Edit", Menu::new()
			.add_native_item(MenuItem::Undo)
			.add_native_item(MenuItem::Redo)))
		.add_submenu(Submenu::new("Window", Menu::new()
			.add_native_item(MenuItem::Minimize)
			.add_native_item(MenuItem::Zoom)
			.add_native_item(MenuItem::Separator)
			.add_item(CustomMenuItem::new("projector", "Projector").accelerator("cmd+P"))))
		.add_submenu(Submenu::new("Help", Menu::with_items([CustomMenuItem::new("Learn More", "Learn More").into()])));

	tauri::Builder::default()
	.setup(|app|{

		Ok(())
	})

	.menu(menu)

	.on_menu_event(|event| {
		let event_name = event.menu_item_id();
		event.window().emit("menu", event_name).unwrap();
	})

	.invoke_handler(tauri::generate_handler![show_projector])

	.build(context)
	
	.expect("error while running tauri application")

	.run(|app_handle, event| match event {
		tauri::RunEvent::Ready {} => {
			let window = app_handle.get_window("main").unwrap();
		}_ => {}
	});
}
