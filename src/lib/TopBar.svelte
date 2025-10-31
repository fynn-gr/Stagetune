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
	projector,
	selectedItem,
	settings,
	showProjector,
	uiPlatform,
} from "@/ts/Stores.svelte";
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

interface Props {
	showTracklist: boolean;
	showEditor: boolean;
	showCurrent: boolean;
	showHotkeys: boolean;
	pauseAll: Function;
	resetAll: Function;
}
let {
	showTracklist = $bindable(),
	showEditor = $bindable(),
	showCurrent = $bindable(),
	showHotkeys = $bindable(),
	pauseAll,
	resetAll,
}: Props = $props();

const appWindow = getCurrentWindow();
let mainID: number = $state(0);

function handleProjector(screen: number | null) {
	if (screen) {
		console.log(projector.screens[screen]);
		emit("projector_set_location", { screen: projector.screens[screen] });
	} else {
		console.log(projector.screens[projector.selectedScreen]);
		emit("projector_set_location", {
			screen: projector.screens[projector.selectedScreen],
		});
	}
}

onMount(async () => {
	projector.screens = await availableMonitors();
	let main = await primaryMonitor();
	mainID = 0;

	projector.screens.forEach((e, i) => {
		if (e.name == main?.name) mainID = i;
	});
	console.log("screens", $state.snapshot(projector.screens));
	console.log("main", main);
	console.log("main ID", mainID);

	if (projector.screens.length < 2) {
		projector.selectedScreen = 0;
	} else if (projector.screens.length - 1 > mainID) {
		projector.selectedScreen = mainID++;
	} else if (mainID > 0) {
		projector.selectedScreen = mainID--;
	} else {
		projector.selectedScreen = 0;
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
				<AppMenuItem id="newPlaylist" name="New" />
				<AppMenuItem id="openPlaylist" name="Open" accelerator="ctrl O" />
				<AppMenuItem id="savePlaylist" name="Save" accelerator="ctrl S" />
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
				<div class="seperator"></div>
				<AppMenuItem id="projector" name="Projector" accelerator="ctrl P" />
				<div class="seperator"></div>
				<AppMenuItem id="showSplash" name="Splash Screen" />
			</AppMenu>
		{/if}

		<!--Debug menu-->
		{#if $settings.debug}
			<AppMenuDev platforms={["mac", "win"]} themes={false} appName="Stagetune">
				<div class="seperator"></div>
				<button
					class="app-menu-item"
					onclick={() => {
						testLive();
					}}
				>
					<p class="name">Live Mode Test</p>
				</button>
				<button
					class="app-menu-item"
					onclick={() => {
						testEdit();
					}}
				>
					<p class="name">Edit Mode Test</p>
				</button>
			</AppMenuDev>
		{/if}

		<div class="spacer" data-tauri-drag-region=""></div>

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
				name={$settings.useSliders ? "Use Knobs" : "Use Sliders"}
				onChange={() => {
					$settings.useSliders = !$settings.useSliders;
				}}
				disabled={!$settings.showVolumeOptions}
			/>
			<TopBarDropdownItem
				name="Scrubbing in Live Mode"
				bind:checked={$settings.allowSkipLive}
				onChange={() => {
					$settings.allowSkipLive = !$settings.allowSkipLive;
				}}
			/>
		</TopBarDropdown>

		<div class="spacer-fix" data-tauri-drag-region=""></div>

		<!--Lock-->
		<ModeSwitch
			id="mode-switch"
			icon="lock"
			iconActive="lock_open"
			bind:active={$editMode}
			toolTip="Toggle Mode"
		/>

		<div class="spacer-fix" data-tauri-drag-region=""></div>

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

		<div class="spacer" data-tauri-drag-region=""></div>

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
				{#each projector.screens as screen, i}
					<TopBarDropdownItem
						name={i == mainID ? `Main` : `Display ${i + 1}`}
						checked={projector.selectedScreen == i}
						onChange={() => {
							projector.selectedScreen = i;
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
