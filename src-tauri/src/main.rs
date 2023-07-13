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
  let submenu = Submenu::new("File", Menu::new()
    .add_item(CustomMenuItem::new("quit".to_string(), "Quit"))
    .add_item(CustomMenuItem::new("close".to_string(), "Close")));
  let menu = Menu::new()
    .add_native_item(MenuItem::Copy)
    .add_item(CustomMenuItem::new("hide", "Hide"))
    .add_submenu(submenu);

  tauri::Builder::default()

  .invoke_handler(tauri::generate_handler![show_projector])

  .menu(menu)

  .build(context)
  
  .expect("error while running tauri application")

  .run(|app_handle, event| match event {
    tauri::RunEvent::Ready {} => {
      let window = app_handle.get_window("main").unwrap();
    }_ => {}
  });
}
