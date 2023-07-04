#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Manager, CustomMenuItem, Menu, MenuItem, Submenu, AboutMetadata, MenuEntry};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

/*
#[tauri::command]
async fn open_video(handle: tauri::AppHandle) {
  let video_window = tauri::WindowBuilder::new(
    &handle,
    "external", /* the unique window label */
    tauri::WindowUrl::External("./video.html".parse().unwrap())
  ).build().unwrap();
}
*/

fn main() {
    let context = tauri::generate_context!();

    tauri::Builder::default()

        //.invoke_handler(tauri::generate_handler![open_video])

        .build(context)

        .expect("error while running tauri application")

        .run(|app_handle, event| match event {
			tauri::RunEvent::Ready {} => {

				let window = app_handle.get_window("main").unwrap();

			}_ => {}
		});
}
