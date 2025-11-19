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
import { open } from "@tauri-apps/plugin-shell";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { getTauriVersion, getVersion } from "@tauri-apps/api/app";
import { onMount, tick } from "svelte";
import { writable } from "svelte/store";


import Keymap from "./pureUI/components/settings/Keymap.svelte";
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
import SettingsValue from "./pureUI/components/settings/SettingsValue.svelte";
import { checkUpdate } from "./ts/Update";

import { _, addMessages, init, locale } from "svelte-i18n";
import en from "./lang/en.json";
import de from "./lang/de.json";

const settings = writable<Settings>(settingsDefault);
const uiPlatform = writable<string>("win");

const appWindow = getCurrentWindow();
let tab: string = $state("general");
let stagetuneVersion: string = $state("");
let tauriVersion: string = $state("");
let recent: Array<string> = []; //keep to save settings file
let update: null | {version: string, notes: string, url: string} = $state(null);

load();
console.log($settings);
addMessages("en", en);
addMessages("de", de);
init({
	initialLocale: "de",
	fallbackLocale: "de",
});

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
	const toSave = {
		settings: $settings,
		uiPlatform: $uiPlatform,
		recent: recent,
	};
	getVersion()
		.then(v => {
			currentVersion = v.slice(0, v.lastIndexOf("."));
		})
		.then(() => {
			console.log("save: ", toSave);
			writeTextFile(
				`Stagetune/${currentVersion}/settings.json`,
				JSON.stringify(toSave),
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
			const obj = JSON.parse(e);
			settings.set(obj.settings);
			uiPlatform.set(obj.uiPlatform);
			recent = obj.recent;
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
	setWindowHeight();

	update = await checkUpdate();
});
$effect(() => {
	locale.set($settings.lang);
});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
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

			<p class="window-title" data-tauri-drag-region>{$_("settings")}</p>

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
				tick().then(() => {
					setWindowHeight();
				});
			}}
		>
			<img src="./icons/settings_tabs/general.svg" alt="" />
			<p>{$_("general")}</p>
		</div>

		<div
			class="tab active"
			class:active={tab == "keymap"}
			onclick={() => {
				tab = "keymap";
				tick().then(() => {
					setWindowHeight();
				});
			}}
		>
			<img src="./icons/settings_tabs/keymap.svg" alt="" />
			<p>{$_("keymap")}</p>
		</div>

		<div
			class="tab"
			class:active={tab == "update"}
			onclick={() => {
				tab = "update";
				tick().then(() => {
					setWindowHeight();
				});
			}}
		>
			<img src="./icons/settings_tabs/update.svg" alt="" />
			<p>{$_("update")}</p>
		</div>

		<div
			class="tab"
			class:active={tab == "developer"}
			onclick={() => {
				tab = "developer";
				tick().then(() => {
					setWindowHeight();
				});
			}}
		>
			<img src="./icons/settings_tabs/dev.svg" alt="" />
			<p>{$_("developer")}</p>
		</div>
	</div>

	<!--settings content-->
	<div class="content-wrapper">
		{#if settings != null}
			{#if tab == "general"}
				<div class="content">
					<SettingsSelect
						name={$_("language")}
						bind:value={$settings.lang}
						options={[
							{ value: "en", name: "English" },
							{ value: "de", name: "Deutsch" },
						]}
						onChange={() => {
							onChange();
						}}
					/>
					<SettingsValue
						name={$_("uiSize")}
						bind:value={$settings.ui_scale}
						min={0.1}
						max={10}
						softMin={0.4}
						softMax={2}
						decimalDisplay={2}
						step={0.1}
						unit="x"
						{onChange}
					/>
					<SettingsCheckbox
						name={$_("showSplash")}
						bind:checked={$settings.show_splash}
						checkboxName={$_("showOnStartup")}
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
					{#if $settings.debug}
						<p>Tauri {tauriVersion}</p>
					{/if}
					{#if update != null}
					<div class="update-box">
						<p>Stagetune <b>{update.version}</b>{$_("available")}</p>
						<p>{update.notes}</p>
						<button onclick={() => {open(update!.url)}}>Download</button>
					</div>
					{/if}
					<br />
					<p>created by Fynn Gr.</p>
					<p>GPL 3.0 License</p>
				</div>
			{:else}
				<div class="content dev">
					<SettingsCheckbox
						name=""
						bind:checked={$settings.debug}
						checkboxName={$_("developerFeatures")}
						{onChange}
					/>
				</div>
			{/if}
		{/if}
	</div>

	{#if $uiPlatform == "mac"}
		<div class="window-rim"></div>
	{/if}
</main>
