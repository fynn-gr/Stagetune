<script lang="ts">
	import "../src/pureUI/scss/index.scss";
	import "./style/App.scss";
	import { uiPlatform } from "./stores";
	import { appWindow } from "@tauri-apps/api/window";

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
			<p>Update</p>
		</div>

		<div class="spacer" data-tauri-drag-region/>

	</div>

	<div class="content">
		<img src="./keymap.png" alt="">
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
		overflow: hidden scroll;
		background-color: var(--properties-BG);

		img {
			width: 100vw;
		}
	}
</style>