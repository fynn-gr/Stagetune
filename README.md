# Stagetune
Free and Open Source music player for stageplays and liveshows

## Features
Stagetune is made to setup auido and music to play during live shows. It includes:
* Volume and Stereo settings
* automatic fade in and fade out
* non destructive editing of audio files
* keyboard shortcuts for navigating and playing for blind operation
* placing Tracks on hotkeys
* annotations in the playlist

currently macOS 10.15+ and Windows 10+ are supported. Linux mit work but is unsupported and untested.

Video playback for Projectors is in development and works technicaly, but is currently only avalible for developers

## Development Setup

Install the following dependencies:
* git
* Rust
* node.js LTS

other recomendet tools:
* vscode
* svelte for vscode extension
* event better toml extension
* prettier extension
* rust analyser extension
* Tauri extension
* pnpm packae manager as a replacement for npm

## Project setup

clone the Repo from github
```
git clone --recurse-submodules https://github.com/Fynn-G/Stagetune.git
cd Stagetune
```
install modules
```
pnpm install
```
### Compiles and Hot-reloads for development
```
pnpm tauri dev
```
### Compiles for Production
```
pnpm tauri build
```
