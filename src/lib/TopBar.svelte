<script lang="ts">
import TopBarButton from "../pureUI/components/TopBarButton.svelte";
import TopBarToggle from "../pureUI/components/TopBarToggle.svelte";
import AppMenu from "../pureUI/components/AppMenu.svelte";
import { availableMonitors, primaryMonitor } from "@tauri-apps/api/window";
import { confirm } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";

import {
	editMode,
	playlist,
	screens,
	selectedItem,
	selectedScreen,
	settings,
	showProjector,
	uiPlatform,
} from "@/ts/Stores";
import WinButtonsMac from "@/pureUI/components/WinButtonsMac.svelte";
import ModeSwitch from "./ModeSwitch.svelte";
import WinButtonsMs from "@/pureUI/components/WinButtonsMS.svelte";
import AppMenuItem from "@/pureUI/components/AppMenuItem.svelte";
import TopBarDropdown from "@/pureUI/components/TopBarDropdown.svelte";
import { testLive } from "@/test/Live.test";
import TopBarDropdownItem from "@/pureUI/components/TopBarDropdownItem.svelte";
import { onMount } from "svelte";
import { emit } from "@tauri-apps/api/event";
import AppMenuDev from "@/pureUI/components/AppMenuDev.svelte";
import { testEdit } from "@/test/Edit.test";
import AppMenuContainer from "@/pureUI/components/AppMenuContainer.svelte";

export let showTracklist: boolean;
export let showEditor: boolean;
export let showCurrent: boolean;
export let showHotkeys: boolean;
export let pauseAll;
export let resetAll;

const appWindow = getCurrentWindow();
let mainID: number;

function handleProjector(screen: number | null) {
	if (screen) {
		console.log($screens[screen]);
		emit("projector_set_location", { screen: $screens[screen] });
	} else {
		console.log($screens[$selectedScreen]);
		emit("projector_set_location", { screen: $screens[$selectedScreen] });
	}
}

onMount(async () => {
	$screens = await availableMonitors();
	let main = await primaryMonitor();
	mainID = 0;

	$screens.forEach((e, i) => {
		if (e.name == main?.name) mainID = i;
	});
	console.log("screens", $screens);
	console.log("main", main);
	console.log("main ID", mainID);

	if ($screens.length < 2) {
		$selectedScreen = 0;
	} else if ($screens.length - 1 > mainID) {
		$selectedScreen = mainID++;
	} else if (mainID > 0) {
		$selectedScreen = mainID--;
	} else {
		$selectedScreen = 0;
	}
});
</script>

<div class="topbar toolbar" data-tauri-drag-region>
	<div class="topbar-container" data-tauri-drag-region>
		<!--mac window buttons-->
		{#if $uiPlatform == "mac"}
			<WinButtonsMac
				onClose={async () => {
					if ($editMode) {
						const confirmed = await confirm("Discard all unsaved changes?", {
							title: "Quit?",
							kind: "warning",
							okLabel: "Quit",
						}).then(async isOK => (isOK ? appWindow.close() : null));
					}
				}}
				onMin={async () => {
					if ($editMode) {
						appWindow.minimize();
					}
				}}
				onMax={async () => {
					if ($editMode) {
						appWindow.toggleMaximize();
					}
				}}
				CanMinimize={$editMode}
				CanMaximise={$editMode}
				CanClose={$editMode}
			/>
		{/if}

		<!--Sidebar-->
		<TopBarToggle
			id="sidebar"
			icon="sidebar"
			bind:active={showTracklist}
			activeColor="var(--hover)"
			toolTip="Toggle Tracklist"
			disabled={!$editMode}
		/>

		<!--menus on windows-->
		{#if $uiPlatform == "win"}
			<AppMenu name="File">
				<AppMenuItem id="newPlaylist" name="New Playlist" />
				<AppMenuItem
					id="openPlaylist"
					name="Open Playlist"
					accelerator="ctrl O"
				/>
				<AppMenuItem
					id="savePlaylist"
					name="Save Playlist"
					accelerator="ctrl S"
				/>
				<AppMenuItem id="addSource" name="Add Source" />
				<div class="seperator" />
				<AppMenuItem
					id="settings"
					name="Settings"
					accelerator="ctrl ,"
					disabled={!$editMode}
				/>
			</AppMenu>
			<AppMenu name="Window">
				<AppMenuItem
					id="showTracklist"
					name="Track List"
					checked={showTracklist && $editMode ? "true" : "false"}
					disabled={!$editMode}
				/>
				<AppMenuItem
					id="showCurrent"
					name="Tracks playing"
					checked={showCurrent ? "true" : "false"}
				/>
				<AppMenuItem
					id="showHotkeys"
					name="Hotkeys"
					checked={showHotkeys ? "true" : "false"}
				/>
				<AppMenuItem
					id="showEditor"
					name="Editor"
					checked={showEditor && $editMode ? "true" : "false"}
					disabled={!$editMode}
				/>
				<div class="seperator" />
				<AppMenuItem id="projector" name="Projector" accelerator="ctrl P" />
				<div class="seperator" />
				<AppMenuItem id="showSplash" name="Splash Screen" />
			</AppMenu>
		{/if}

		<!--Debug menu-->
		{#if $settings.debug}
			<AppMenuDev platforms={["mac", "win"]} themes={false}>
				<div class="seperator" />
				<button
					class="app-menu-item"
					on:click={() => {
						testLive();
					}}
				>
					<p class="name">Live Mode Test</p>
				</button>
				<button
					class="app-menu-item"
					on:click={() => {
						testEdit();
					}}
				>
					<p class="name">Edit Mode Test</p>
				</button>
			</AppMenuDev>
		{/if}

		<div class="spacer" data-tauri-drag-region="" />

		<!--Playlist options-->
		<TopBarDropdown icon="settings" toolTip="Playlist Settings">
			<TopBarDropdownItem
				name="Annotations"
				bind:checked={$settings.showAnnotations}
				onChange={() => {
					$settings.showAnnotations = !$settings.showAnnotations;
				}}
			/>
			<TopBarDropdownItem
				name="Fade Options"
				bind:checked={$settings.showFadeOptions}
				onChange={() => {
					$settings.showFadeOptions = !$settings.showFadeOptions;
				}}
			/>
			<TopBarDropdownItem
				name="Volume Options"
				bind:checked={$settings.showVolumeOptions}
				onChange={() => {
					$settings.showVolumeOptions = !$settings.showVolumeOptions;
				}}
			/>
			<TopBarDropdownItem
				name="Scrubbing in Live Mode"
				bind:checked={$settings.allowSkipLive}
				onChange={() => {
					$settings.allowSkipLive = !$settings.allowSkipLive;
				}}
			/>
		</TopBarDropdown>

		<!--Add Annotation-->
		<TopBarButton
			id="comment-add"
			icon="comment_add"
			disabled={!$editMode}
			onClick={() => {
				if ($selectedItem == null) {
					playlist.update(e => {
						e.push({
							type: "annotation",
							annotation: { text: "Annotation", color: null },
						});
						return e;
					});
				} else {
					playlist.update(e => {
						e.splice($selectedItem + 1, 0, {
							type: "annotation",
							annotation: { text: "Annotation", color: null },
						});
						return e;
					});
				}
				console.log($playlist);
			}}
			toolTip="Add comment"
		/>

		{#if $settings.debug}
			<!--Add Loop-->
			<TopBarButton
				id="loop-add"
				icon="repeat"
				disabled={!$editMode}
				onClick={() => {
					if ($selectedItem == null) {
						playlist.update(e => {
							e.push({
								type: "loop",
								name: "Loop",
								annotation: null,
								items: [],
							});
							return e;
						});
					} else {
						playlist.update(e => {
							e.splice($selectedItem + 1, 0, {
								type: "loop",
								name: "Loop",
								annotation: null,
								items: [],
							});
							return e;
						});
					}
					console.log($playlist);
				}}
				toolTip="Add loop"
			/>
		{/if}

		<div class="spacer-fix" data-tauri-drag-region="" />

		<!--Lock-->
		<ModeSwitch
			id="mode-switch"
			icon="lock"
			iconActive="lock_open"
			bind:active={$editMode}
			activeColor="var(--accent)"
			toolTip="Toggle Mode"
		/>

		<div class="spacer-fix" data-tauri-drag-region="" />

		<div class="topbar-group">
			<!--reset all-->
			<TopBarButton
				id="reset-all-tracks"
				icon="reset"
				toolTip="Reset all tracks"
				onClick={resetAll}
			/>

			<!--stop all-->
			<TopBarButton
				id="stop-all-tracks"
				icon="stop"
				toolTip="Stop all tracks"
				onClick={pauseAll}
			/>
		</div>

		<div class="spacer" data-tauri-drag-region="" />

		<!--projector-->
		<div class="topbar-group">
			<TopBarToggle
				id="projector"
				icon="projector"
				bind:active={$showProjector}
				onChange={() => {
					handleProjector(null);
				}}
				activeColor="var(--hover)"
				toolTip="Toggle Edior"
				disabled={!$editMode}
			/>

			<TopBarDropdown icon={null} toolTip="Projector">
				{#each $screens as screen, i}
					<TopBarDropdownItem
						name={i == mainID ? `Main` : `Display ${i + 1}`}
						checked={$selectedScreen == i}
						onChange={() => {
							$selectedScreen = i;
							handleProjector(i);
						}}
					/>
				{/each}
			</TopBarDropdown>
		</div>

		<!--editor-->
		<TopBarToggle
			id="toggle-editor"
			icon="cut"
			bind:active={showEditor}
			activeColor="var(--hover)"
			toolTip="Toggle Edior"
			disabled={!$editMode}
		/>

		<div class="topbar-group">
			<!--current playing-->
			<TopBarToggle
				id="toggle-tracks-playing"
				icon="active_play"
				bind:active={showCurrent}
				activeColor="var(--hover)"
				toolTip="Toggle Tracks playing"
			/>

			<!--hotkeys-->
			<TopBarToggle
				id="toggle-hotkeys"
				icon="hotkeys"
				bind:active={showHotkeys}
				activeColor="var(--hover)"
				toolTip="Toggle Hotkeys"
			/>
		</div>

		<!--windows window buttons-->
		{#if $uiPlatform == "win"}
			<WinButtonsMs
				onClose={async () => {
					if ($editMode) {
						const confirmed = await confirm("Discard unsaved changes?", {
							title: "Quit?",
							kind: "warning",
							okLabel: "Quit",
						}).then(isOK => (isOK ? appWindow.close() : null));
					}
				}}
				onMin={async () => {
					if ($editMode) {
						appWindow.minimize();
					}
				}}
				onMax={async () => {
					if ($editMode) {
						appWindow.toggleMaximize();
					}
				}}
				CanMinimize={$editMode}
				CanMaximise={$editMode}
				CanClose={$editMode}
			/>
		{/if}
	</div>
</div>
