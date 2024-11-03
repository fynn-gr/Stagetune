# Stagetune

Free and Open Source music and video player for stageplays and liveshows

## Features

Stagetune is made to setup audio and video to play during live shows. It includes:

- automatic fade in and fade out
- non destructive editing of audio files
- unobstructed video playback on a projector
- keyboard shortcuts for fast navigation and blind operation
- assigning hotkeys to tracks
- annotations in the playlist

currently macOS 10.15+ and Windows 10+ are supported.

## Development Setup

Install the following dependencies:

- [git](https://git-scm.com/)
- [Rust](https://www.rust-lang.org/)
- [node.js LTS](https://nodejs.org/en)

other recomendet tools:

- vscode
- Svelte for vscode extension
- even better toml extension
- Prettier extension
- Rust analyser extension
- Tauri extension
- pnpm package manager to replace npm

## Project setup

clone the Repo from github

```
git clone --recursive-submodules https://github.com/fynn-gr/Stagetune.git
cd stagetune
```

install modules

```
pnpm install
```

### Compile and Hot-reload for development

```
pnpm tauri dev
```

### Compile for Production

```
pnpm tauri build
```
