<script lang="ts">
	import "../src/pureUI/scss/index.scss";
	import "./style/App.scss";
	import "./style/settings.scss";
	import { uiPlatform } from "./stores";
	import { LogicalSize, appWindow, availableMonitors } from "@tauri-apps/api/window";
	import { onMount } from "svelte";
	import Keymap from "./pureUI/components/Keymap.svelte";
	import WinButtonsMac from "./pureUI/components/WinButtonsMac.svelte";

	let tab: string = "general";
	let keymapModifier: string = "standart";
	let screens = [];
	let projectorScreen: number = 1;
	let mainScreen: number = 0;

	onMount(async () => {
		appWindow.setSize(new LogicalSize(800, 480))

		screens = await availableMonitors();
		console.log(screens);

		setWindowHeight();
	})

	function setWindowHeight() {
		let content: HTMLElement = document.querySelector('.content')
		let height = content.offsetHeight;
		appWindow.setSize(new LogicalSize(800, height + 80))
	}

</script>

<main class={"window-body dark " + $uiPlatform}>
	<div class="topbar tabbar" data-tauri-drag-region>

		<p class="title" data-tauri-drag-region>Settings</p>

		{#if $uiPlatform == "mac"}
			<WinButtonsMac 
				CanMaximise={false}
				CanMinimize={false}
				onClose={() => {
					appWindow.close();
				}}
			/>
		{/if}

		<div class="spacer" data-tauri-drag-region/>

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="tab"
			class:active={tab == "general"}
			on:click={() => {tab = "general"; setWindowHeight()}}
		>
			<img src="./icons/settings_tabs/general.svg" alt="">
			<p>General</p>
		</div>

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="tab active"
			class:active={tab == "keymap"}
			on:click={() => {tab = "keymap"; setWindowHeight()}}
		>
			<img src="./icons/settings_tabs/keymap.svg" alt="">
			<p>Keymap</p>
		</div>

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="tab"
			class:active={tab == "projector"}
			on:click={() => {tab = "projector"; setWindowHeight()}}
		>
			<img src="./icons/settings_tabs/projector.svg" alt="">
			<p>Projector</p>
		</div>

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div
			class="tab"
			class:active={tab == "update"}
			on:click={() => {tab = "update"; setWindowHeight();}}
		>
			<img src="./icons/settings_tabs/update.svg" alt="">
			<p>Update</p>
		</div>

		<div class="spacer" data-tauri-drag-region/>

	</div>

	<!-- svelte-ignore empty-block -->
	{#if tab == "general"}
		<div class="content">
			<div class="option">
				<p class="name">Splash screen:</p>
				<input type="checkbox">
				<p class="checkbox-name">Show on startup</p>
			</div>
			<div class="option">
				<p class="name">UI size:</p>
				<select>
					<option value={1}>Small</option>
					<option value={1.3}>Standart</option>
					<option value={1.5}>Larger</option>
					<option value={1.8}>Large</option>
					<option value={2}>Double</option>	
				</select>
			</div>
		</div>
	{:else if tab == "keymap"}
		<div class="content">
			<div class="keymap-frame">
				<Keymap
					configStandart={{
						KeyW: "Move Up",
						KeyA: "Reset selected track",
						KeyS: "Move Down",
						KeyD: "Skip track",
						ArrowUp: "Move Up",
						ArrowLeft: "Reset selected track",
						ArrowDown: "Move Down",
						ArrowRight: "Skip track",
						Digit1: "Hotkey - 1",
						Digit2: "Hotkey - 2",
						Digit3: "Hotkey - 3",
						Digit4: "Hotkey - 4",
						Digit5: "Hotkey - 5",
						Digit6: "Hotkey - 6",
						Digit7: "Hotkey - 7",
						Digit8: "Hotkey - 8",
						Digit9: "Hotkey - 9",
					}}
					configCmd={{
						KeyO: "Open directory",
						KeyS: "Save playlist",
						KeyP: "open projector window"
					}}
					configAlt={{
						Digit1: "Remove hotkey - 1",
						Digit2: "Remove hotkey - 2",
						Digit3: "Remove hotkey - 3",
						Digit4: "Remove hotkey - 4",
						Digit5: "Remove hotkey - 5",
						Digit6: "Remove hotkey - 6",
						Digit7: "Remove hotkey - 7",
						Digit8: "Remove hotkey - 8",
						Digit9: "Remove hotkey - 9",
					}}
					configCtrl={{
						KeyO: "Open directory",
						KeyS: "Save playlist",
						KeyP: "Open projector window"
					}}
				/>
			</div>
		</div>
	{:else if tab == "projector"}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="content">
			{#each screens as screen, i}
			<div
				class="screen"
				class:active={i == projectorScreen}
				on:click={() => {
					
				}}
			>
				<div
					class="display"
					style={`aspect-ratio: ${screen.size.width} / ${screen.size.height};`}
				>
					<p>{i == projectorScreen ? "Projector" : i == mainScreen ? "Main" : ""}</p>
				</div>
				<span>
					<p>{screen.name}</p>
					<p>{screen.size.width} x {screen.size.height} @{screen.scaleFactor}</p>
				</span>
			</div>
			{/each}
		</div>
	{:else}
	{/if}

	<div class="window-rim" />
</main>
