<script lang="ts">
	import "../src/pureUI/scss/index.scss";
	import "./style/App.scss";
	import { uiPlatform } from "./stores";
	import { LogicalSize, appWindow } from "@tauri-apps/api/window";
	import { onMount } from "svelte";
	import { prevent_default } from "svelte/internal";
	import Keymap from "./pureUI/components/Keymap.svelte";


	onMount(() => {
		appWindow.setSize(new LogicalSize(800, 480))

		document.addEventListener("keydown", e => {
			if (e.metaKey) {

			}
		})
		document.addEventListener("keyup", e => {

		})
	})
</script>

<main class={"window-body dark " + $uiPlatform}>
	<div class="topbar tabbar" data-tauri-drag-region>

		<p class="title" data-tauri-drag-region>Settings</p>

		{#if $uiPlatform == "mac"}
			<div
				class="win-buttons-mac"
				data-tauri-drag-region
			>
				<button
					on:click={async () => {
						appWindow.close();
					}}
				>
					<img src="./icons/winButtonsMacClose.svg" alt="close" />
				</button>
				<button style="filter: saturate(0);">
					<img src="./icons/winButtonsMacMin.svg" alt="minimize" />
				</button>
				<button style="filter: saturate(0);">
					<img src="./icons/winButtonsMacMax.svg" alt="maximize" />
				</button>
			</div>
		{/if}

		<div class="spacer" data-tauri-drag-region/>

		<div class="tab active">
			<div class="icon"></div>
			<p>Keymap</p>
		</div>

		<div class="tab">
			<div class="icon"></div>
			<p>Projector</p>
		</div>

		<div class="tab">
			<div class="icon"></div>
			<p>Update</p>
		</div>

		<div class="spacer" data-tauri-drag-region/>

	</div>

	<div class="content">
		<div class="keymap-frame">
			<Keymap
				keySize={3}
				configStandart={{
					W: "Up",
					A: "Reset",
					S: "Down",
					D: "Skip",
					ArrowUp: "Up"
				}}
				configCmd={{
					O: "Open",
					S: "Save",
					P: "Projector"
				}}
				configAlt={{}}
				modifier="cmd"
			/>
		</div>
	</div>

	<div class="window-rim" />
</main>

<style lang="scss">
	.topbar {
		border-radius: var(--win-corner) var(--win-corner) 0 0 !important;

		.win-buttons-mac {
			position: fixed;
		}
	}

	.body {
		border-radius: var(--win-corner);
	}

	.window-body {
		grid-template-columns: 1fr;
		grid-template-rows: 80px auto;
		grid-template-areas: 'topBar'
							 'content';
		background-color: transparent;
	}

	.content {
		grid-area: content;
		inset: 0 0 0 0;
		display: flex;
		background-color: var(--properties-BG);
		border-radius: 0 0 var(--win-corner) var(--win-corner);


	}
</style>