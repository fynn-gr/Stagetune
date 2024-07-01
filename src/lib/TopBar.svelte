<script lang="ts">
import TopBarButton from "../pureUI/components/TopBarButton.svelte";
import TopBarToggle from "../pureUI/components/TopBarToggle.svelte";
import AppMenu from "../pureUI/components/AppMenu.svelte";
import {
	appWindow,
	availableMonitors,
	primaryMonitor,
	type Monitor,
} from "@tauri-apps/api/window";
import { confirm } from "@tauri-apps/api/dialog";

import {
	editMode,
	playlist,
	selectedItem,
	settings,
	showProjector,
	uiPlatform,
} from "@/ts/Stores";
import WinButtonsMac from "@/pureUI/components/WinButtonsMac.svelte";
import ModeSwitch from "./ModeSwitch.svelte";
import WinButtonsMs from "@/pureUI/components/WinButtonsMS.svelte";
import AppMenuItem from "@/pureUI/components/AppMenuItem.svelte";
import TopBarDropdown from "@/pureUI/components/TopBarDropdown.svelte";
import { test } from "@/test/Loop.test";
import TopBarDropdownItem from "@/pureUI/components/TopBarDropdownItem.svelte";
import { onMount } from "svelte";
import { emit } from "@tauri-apps/api/event";

export let showTracklist: boolean;
export let showEditor: boolean;
export let showCurrent: boolean;
export let showHotkeys: boolean;
export let pauseAll;
export let resetAll;

let screens: Monitor[] = [];
let selectedScreen: number = 0;
let mainID: number;

onMount(async () => {
	screens = await availableMonitors();
	let main = await primaryMonitor();
	mainID = 0;
	
	screens.forEach((e, i) => {
		if (e.name == main?.name) mainID = i;
	})

	if (screens.length < 2) {
		selectedScreen = 0;
	} else if (screens.length -1 > mainID){
		selectedScreen = mainID++;
	} else if (mainID > 0) {
		selectedScreen = mainID--;
	} else {
		selectedScreen = 0;
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
							type: "warning",
							okLabel: "Quit",
						}).then(isOK => (isOK ? appWindow.close() : null));
					}
				}}
				onMin={() => {
					if ($editMode) {
						appWindow.minimize();
					}
				}}
				onMax={() => {
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
			icon="sidebar"
			bind:active={showTracklist}
			activeColor="var(--hover)"
			toolTip="Toggle Tracklist"
			disabled={!$editMode}
		/>

		<!--menus on windows-->
		{#if $uiPlatform == "win"}
			<AppMenu name="File">
				<AppMenuItem id="open" name="Open" accelerator="ctrl O" />
				<AppMenuItem id="save" name="Save" accelerator="ctrl S" />
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
				{#if $settings.video}
					<div class="seperator" />
					<AppMenuItem id="projector" name="Projector" accelerator="ctrl P" />
				{/if}
				<div class="seperator" />
				<AppMenuItem id="showSplash" name="Splash Screen" />
			</AppMenu>
		{/if}

		<!--Debug menu-->
		{#if $settings.debug}
			<AppMenu name="Dev">
				<button
					class="app-menu-item"
					on:click={() => {
						$uiPlatform = "mac";
					}}
				>
					<p class="name">mac</p>
				</button>
				<button
					class="app-menu-item"
					on:click={() => {
						$uiPlatform = "win";
					}}
				>
					<p class="name">win</p>
				</button>
				<div class="seperator" />
				<button
					class="app-menu-item"
					on:click={() => {
						test(false);
					}}
				>
					<p class="name">Continuous Test</p>
				</button>
				<button
					class="app-menu-item"
					on:click={() => {
						test(true);
					}}
				>
					<p class="name">Penetration Test</p>
				</button>
			</AppMenu>
		{/if}

		<div class="spacer" data-tauri-drag-region="" />

		<!--Playlist options-->
		<TopBarDropdown icon="settings" toolTip="Playlist Settings">
			<TopBarDropdownItem
				name="Annotations"
				bind:checked={$settings.showAnnotations}
				onChange={() => {}}
			/>
			<TopBarDropdownItem
				name="Fade Options"
				bind:checked={$settings.showFadeOptions}
				onChange={() => {}}
			/>
			<TopBarDropdownItem
				name="Volume Options"
				bind:checked={$settings.showVolumeOptions}
				onChange={() => {}}
			/>
			<TopBarDropdownItem
				name="Scrubbing in Live Mode"
				bind:checked={$settings.allowSkipLive}
				onChange={() => {}}
			/>
		</TopBarDropdown>

		<!--Add Annotation-->
		<TopBarButton
			icon="comment_add"
			disabled={!$editMode}
			onClick={() => {
				if ($selectedItem == null) {
					playlist.update(e => {
						e.push({
							type: "annotation",
							origin: "playlist",
							annotation: { text: "Annotation", color: null },
						});
						return e;
					});
				} else {
					playlist.update(e => {
						e.splice($selectedItem + 1, 0, {
							type: "annotation",
							origin: "playlist",
							annotation: { text: "Annotation", color: null },
						});
						return e;
					});
				}
				console.log($playlist);
			}}
			toolTip="Add comment"
		/>

		<div class="spacer-fix" data-tauri-drag-region="" />

		<!--Lock-->
		<ModeSwitch
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
				icon="reset"
				toolTip="Reset all tracks"
				onClick={resetAll}
			/>

			<!--stop all-->
			<TopBarButton icon="stop" toolTip="Stop all tracks" onClick={pauseAll} />
		</div>

		<div class="spacer" data-tauri-drag-region="" />

		<!--projector-->
		<div class="topbar-group">
			<TopBarToggle
				icon="projector"
				bind:active={$showProjector}
				activeColor="var(--hover)"
				toolTip="Toggle Edior"
				disabled={!$editMode}
			/>

			<TopBarDropdown icon={null} toolTip="Projector">
				{#each screens as screen, i}
					<TopBarDropdownItem
						name={i == mainID ? `Main` : `Display ${i + 1}`}
						checked={selectedScreen == i}
						onChange={() => {
							if (selectedScreen != i) selectedScreen = i;
							emit("projector_set_location", {screen: screen})
						}}
					/>
				{/each}
			</TopBarDropdown>
		</div>

		<!--editor-->
		<TopBarToggle
			icon="cut"
			bind:active={showEditor}
			activeColor="var(--hover)"
			toolTip="Toggle Edior"
			disabled={!$editMode}
		/>

		<div class="topbar-group">
			<!--current playing-->
			<TopBarToggle
				icon="active_play"
				bind:active={showCurrent}
				activeColor="var(--hover)"
				toolTip="Toggle Tracks playing"
			/>

			<!--hotkeys-->
			<TopBarToggle
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
							type: "warning",
							okLabel: "Quit",
						}).then(isOK => (isOK ? appWindow.close() : null));
					}
				}}
				onMin={() => {
					if ($editMode) {
						appWindow.minimize();
					}
				}}
				onMax={() => {
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
