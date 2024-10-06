#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

use tauri::Emitter;
use tauri::Manager;

#[tauri::command]
async fn show_projector(handle: tauri::AppHandle, show: bool) {
	if show == true {
		let video_window = tauri::WebviewWindowBuilder::new(
			&handle,
			"video_window", /* the unique window label */
			tauri::WebviewUrl::App("Projector.html".into()),
		)
		.build()
		.unwrap();

		video_window.set_always_on_top(true);
		video_window.set_title("projector");
	} else {
		let window = handle.get_webview_window("video_window").unwrap();
		window.close();
	}
}

#[tauri::command]
async fn open_settings(handle: tauri::AppHandle, invoke_message: String) {
	let settings_window = tauri::WebviewWindowBuilder::new(
		&handle,
		"settings_window",
		tauri::WebviewUrl::App("settings.html".into()),
	)
	.transparent(true)
	.theme(Some(tauri::Theme::Dark))
	.build()
	.unwrap();
	settings_window.set_resizable(false);
	settings_window.set_decorations(false);
	settings_window.emit("settings", invoke_message);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
	let context = tauri::generate_context!();

	tauri::Builder::default()
		.plugin(tauri_plugin_notification::init())
		.plugin(tauri_plugin_dialog::init())
		.plugin(tauri_plugin_shell::init())
		.plugin(tauri_plugin_http::init())
		.plugin(tauri_plugin_os::init())
		.plugin(tauri_plugin_global_shortcut::Builder::new().build())
		.plugin(tauri_plugin_clipboard_manager::init())
		.plugin(tauri_plugin_process::init())
		.plugin(tauri_plugin_fs::init())
		//setup
		.setup(|app| {
			app.on_menu_event(move |app, event| {
				let event_name = event.id();
				app.emit("menu", event_name);
			});
			Ok(())
		})
		.invoke_handler(tauri::generate_handler![show_projector, open_settings])
		.build(context)
		.expect("error while running tauri application")
		.run(|app_handle, event| match event {
			tauri::RunEvent::Ready {} => {
				let window = app_handle.get_webview_window("main").unwrap();
			}
			_ => {}
		});
}
