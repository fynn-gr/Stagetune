<script lang="ts">
import "../src/pureUI/scss/index.scss";
import "./style/App.scss";
import "./style/settings.scss";
import {
	LogicalSize,
	availableMonitors,
	currentMonitor,
	primaryMonitor,
} from "@tauri-apps/api/window";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getTauriVersion, getVersion } from "@tauri-apps/api/app";
import { onMount, tick } from "svelte";
import { writable } from "svelte/store";

import { uiPlatform } from "./ts/Stores.svelte";
import Keymap from "./pureUI/components//settings/Keymap.svelte";
import WinButtonsMac from "./pureUI/components/WinButtonsMac.svelte";
import WinButtonsMs from "./pureUI/components/WinButtonsMS.svelte";
import {
	BaseDirectory,
	readTextFile,
	writeTextFile,
} from "@tauri-apps/plugin-fs";
import { emit } from "@tauri-apps/api/event";
import SettingsCheckbox from "./pureUI/components/settings/SettingsCheckbox.svelte";
import SettingsSelect from "./pureUI/components/settings/SettingsSelect.svelte";
import { settingsDefault, type Settings } from "./ts/SettingsDefault";

const settings = writable<Settings>(settingsDefault);
const appWindow = getCurrentWindow();
let tab: string = $state("general");
let stagetuneVersion: string;
let tauriVersion: string;

load();
console.log($settings);

async function setWindowHeight() {
	if ($uiPlatform == "mac") {
		let content: HTMLElement = document.querySelector(".content")!;
		tick();
		let height = content.offsetHeight;
		await getCurrentWindow().setSize(new LogicalSize(800, height + 80));
	} else {
		await getCurrentWindow().setSize(new LogicalSize(800, 500));
	}
}

function onChange() {
	save();
}

function save() {
	let currentVersion: string;
	getVersion()
		.then(v => {
			currentVersion = v.slice(0, v.lastIndexOf("."));
		})
		.then(() => {
			console.log("save: ", $settings);
			writeTextFile(
				`Stagetune/${currentVersion}/settings.json`,
				JSON.stringify($settings),
				{
					baseDir: BaseDirectory.Config,
				},
			);
			emit("reload_settings");
		});
}

async function load() {
	let currentVersion;

	getVersion().then(v => {
		currentVersion = v.slice(0, v.lastIndexOf("."));
		readTextFile(`Stagetune/${currentVersion}/settings.json`, {
			baseDir: BaseDirectory.Config,
		}).then(async e => {
			$settings = JSON.parse(e);
			console.log("loaded settings", $settings);
		});
	});
}

onMount(async () => {
	stagetuneVersion = await getVersion();
	tauriVersion = await getTauriVersion();

	console.log("all av Monitors: ", await availableMonitors());
	console.log("current Monitor: ", await currentMonitor());
	console.log("primary Monitor: ", await primaryMonitor());
});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<main class={"window-body settings dark " + $uiPlatform}>
	<div class="topbar title-bar" data-tauri-drag-region>
		<div class="topbar-container">
			{#if $uiPlatform == "mac"}
				<WinButtonsMac
					CanMaximise={false}
					CanMinimize={false}
					onClose={() => {
						appWindow.close();
					}}
				/>
			{/if}

			<p class="window-title" data-tauri-drag-region>Settings</p>

			{#if $uiPlatform == "win"}
				<WinButtonsMs
					CanMaximise={false}
					CanMinimize={false}
					onClose={() => {
						appWindow.close();
					}}
					CloseOnly={true}
				/>
			{/if}
		</div>
	</div>

	<div class="tabs" data-tauri-drag-region>
		<div
			class="tab"
			class:active={tab == "general"}
			onclick={() => {
				tab = "general";
			}}
		>
			<img src="./icons/settings_tabs/general.svg" alt="" />
			<p>General</p>
		</div>

		<div
			class="tab active"
			class:active={tab == "keymap"}
			onclick={() => {
				tab = "keymap";
			}}
		>
			<img src="./icons/settings_tabs/keymap.svg" alt="" />
			<p>Keymap</p>
		</div>

		<div
			class="tab"
			class:active={tab == "update"}
			onclick={() => {
				tab = "update";
			}}
		>
			<img src="./icons/settings_tabs/update.svg" alt="" />
			<p>About</p>
		</div>

		<div
			class="tab"
			class:active={tab == "developer"}
			onclick={() => {
				tab = "developer";
			}}
		>
			<img src="./icons/settings_tabs/dev.svg" alt="" />
			<p>Developer</p>
		</div>
	</div>

	<!--settings content-->
	<div class="content-wrapper">
		{#if settings != null}
			{#if tab == "general"}
				<div class="content">
					<!--
					<SettingsSelect
						name="Language: "
						bind:value={$settings.lang}
						options={[
							{ value: "en", name: "English" },
							{ value: "de", name: "Deutsch" },
						]}
						{onChange}
					/>
					-->
					<SettingsSelect
						name="UI size:"
						bind:value={$settings.ui_scale}
						options={[
							{ value: 1, name: "Small" },
							{ value: 1.3, name: "Standart" },
							{ value: 1.6, name: "Large" },
							{ value: 2, name: "Double" },
						]}
						{onChange}
					/>
					<SettingsCheckbox
						name="Splash Screen:"
						bind:checked={$settings.show_splash}
						checkboxName="Show on startup"
						{onChange}
					/>
					<!--
					<SettingsOption
						name="Performance: "
						type="checkbox"
						bind:value={$settings.performance_mode}
						checkboxName="Low performance mode"
						{onChange}
					/>
					-->
				</div>
			{:else if tab == "keymap"}
				<div class="content">
					<div class="keymap-frame">
						<Keymap />
					</div>
				</div>
			{:else if tab == "update"}
				<div class="content update">
					<p class="update">Stagetune {stagetuneVersion || ""}</p>
					<p>Tauri {tauriVersion}</p>
					<br />
					<p>created by Fynn Gr.</p>
					<p>GPL 3.0 License</p>
				</div>
			{:else}
				<div class="content dev">
					<SettingsCheckbox
						name="Developer Features:"
						bind:checked={$settings.debug}
						checkboxName="Enable developer features"
						{onChange}
					/>
				</div>
			{/if}
		{/if}
	</div>

	{#if $uiPlatform == "mac"}
		<div class="window-rim" />
	{/if}
</main>
