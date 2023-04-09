#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Manager, CustomMenuItem, Menu, MenuItem, Submenu, AboutMetadata, MenuEntry};
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    let context = tauri::generate_context!();

    tauri::Builder::default()

        .build(context)

        .expect("error while running tauri application")

        .run(|app_handle, event| match event {
			tauri::RunEvent::Ready {} => {

				let window = app_handle.get_window("main").unwrap();

				//apply Background Blur on macos, skip on windows
				#[cfg(target_os = "macos")]
				apply_vibrancy(&window, NSVisualEffectMaterial::Sidebar, None, Some(9.0))
					.expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");
			}_ => {}
		});
}
