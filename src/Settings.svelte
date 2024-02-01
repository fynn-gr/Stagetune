<script lang="ts">
	import "../src/pureUI/scss/index.scss";
	import "./style/App.scss";
	import "./style/settings.scss";
	import { uiPlatform } from "./stores";
	import {
		LogicalSize,
		appWindow,
		availableMonitors,
	} from "@tauri-apps/api/window";
	import { getTauriVersion, getVersion } from "@tauri-apps/api/app";
	import { afterUpdate, onMount, tick } from "svelte";
	import { emit } from "@tauri-apps/api/event";
	import { loadSettings, saveSettings } from "./saveLoad";
	import { settings } from "./stores";

	import Keymap from "./pureUI/components//settings/Keymap.svelte";
	import WinButtonsMac from "./pureUI/components/WinButtonsMac.svelte";
	import SettingsOption from "./pureUI/components/settings/SettingsOption.svelte";
	import WinButtonsMs from "./pureUI/components/WinButtonsMS.svelte";

	let tab: string = "general";
	let screens = [];
	let projectorScreen: number = 1;
	let mainScreen: number = 0;
	let stagetuneVersion;
	let tauriVersion;
	loadSettings();
	console.log($settings);

	onMount(async () => {
		screens = await availableMonitors();
		stagetuneVersion = await getVersion();
		tauriVersion = await getTauriVersion();
	});

	function setWindowHeight() {
		if ($uiPlatform == "mac") {
			let content: HTMLElement = document.querySelector(".content");
			tick();
			let height = content.offsetHeight;
			appWindow.setSize(new LogicalSize(800, height + 80));
		} else {
			appWindow.setSize(new LogicalSize(800, 500));
		}
	}

	function onChange() {
		saveSettings();
		emit("reload_settings");
	}

	afterUpdate(() => {
		setWindowHeight();
	});
</script>

<main class={"window-body settings dark " + $uiPlatform}>
	<div class="topbar title-bar" data-tauri-drag-region>
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

	<div class="tabs" data-tauri-drag-region>	

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="tab"
			class:active={tab == "general"}
			on:click={() => {
				tab = "general";
			}}
		>
			<img src="./icons/settings_tabs/general.svg" alt="" />
			<p>General</p>
		</div>

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="tab active"
			class:active={tab == "keymap"}
			on:click={() => {
				tab = "keymap";
			}}
		>
			<img src="./icons/settings_tabs/keymap.svg" alt="" />
			<p>Keymap</p>
		</div>

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		{#if $settings.video}
			<div
				class="tab"
				class:active={tab == "projector"}
				on:click={() => {
					tab = "projector";
				}}
			>
				<img src="./icons/settings_tabs/projector.svg" alt="" />
				<p>Projector</p>
			</div>
		{/if}

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="tab"
			class:active={tab == "update"}
			on:click={() => {
				tab = "update";
			}}
		>
			<img src="./icons/settings_tabs/update.svg" alt="" />
			<p>Update</p>
		</div>

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="tab"
			class:active={tab == "developer"}
			on:click={() => {
				tab = "developer";
			}}
		>
			<img src="./icons/settings_tabs/dev.svg" alt="" />
			<p>Developer</p>
		</div>

	</div>

	<!-- svelte-ignore empty-block -->
	<div class="content-wrapper">

		{#if settings != null}
			{#if tab == "general"}
				<div class="content">
					<!--
					<SettingsOption
						name="Language: "
						type="select"
						bind:value={$settings.lang}
						options={[
							{ value: "en", name: "English" },
							{ value: "de", name: "Deutsch" },
						]}
						{onChange}
					/>
					-->
					<SettingsOption
						name="UI size:"
						type="select"
						bind:value={$settings.ui_scale}
						options={[
							{ value: 1, name: "Small" },
							{ value: 1.3, name: "Standart" },
							{ value: 1.6, name: "Large" },
							{ value: 2, name: "Double" },
						]}
						{onChange}
					/>
					<SettingsOption
						name="Splash Screen:"
						type="checkbox"
						bind:value={$settings.show_splash}
						checkboxName="Show on startup"
						{onChange}
					/>
					<SettingsOption
						name="Performance: "
						type="checkbox"
						bind:value={$settings.performance_mode}
						checkboxName="Low performance mode"
						{onChange}
					/>
				</div>
			{:else if tab == "keymap"}
				<div class="content">
					<div class="keymap-frame">
						<Keymap />
					</div>
				</div>
			{:else if tab == "projector"}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<div class="content">
					{#each screens as screen, i}
						<div
							class="screen"
							class:active={i == projectorScreen}
							on:click={() => {}}
						>
							<div
								class="display"
								style={`aspect-ratio: ${screen.size.width} / ${screen.size.height};`}
							>
								<p>
									{i == projectorScreen
										? "Projector"
										: i == mainScreen
										? "Main"
										: ""}
								</p>
							</div>
							<span>
								<p>{screen.name}</p>
								<p>
									{screen.size.width} x {screen.size.height} @{screen.scaleFactor}
								</p>
							</span>
						</div>
					{/each}
				</div>
			{:else if tab == "update"}
				<div class="content update">
					<p class="update">Stagetune {stagetuneVersion || ""}</p>
					<p>Tauri {tauriVersion}</p>
					<p>created by Fynn Gr.</p>
					<p>GPL 3.0</p>

					<button
						on:click={() => {
							console.log("check for updates")
							emit("tauri://update")}}
					>Check for Updates</button>
				</div>
			{:else}
				<div class="content dev">
					<SettingsOption
						name="Developer Features:"
						type="checkbox"
						bind:value={$settings.debug}
						checkboxName="Enable developer features"
						{onChange}
					/>
					<SettingsOption
						name=""
						type="checkbox"
						bind:value={$settings.video}
						checkboxName="Enable projector"
						{onChange}
					/>
				</div>
			{/if}
		{/if}
		
	</div>

	<div class="window-rim" />
</main>
