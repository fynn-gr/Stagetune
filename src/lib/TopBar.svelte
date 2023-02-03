<script>
	import WinButtonsMac from '../../pureUI/components/WinButtonsMac.svelte'
	import WinButtonsMS from '../../pureUI/components/WinButtonsMS.svelte'

	export let uiPlatform;
</script>

<div class="topBar toolBar" data-tauri-drag-region>
	<div class="topBarContainer" data-tauri-drag-region>
		{#if uiPlatform == "mac"}
			<WinButtonsMac />
		{/if}
		<div class="topBarContent" data-tauri-drag-region>
			<button class="toolBarButton">
				<object data="../pureUI/icons/tb_sidebar.svg" aria-label=""></object>
			</button>
			<button class="toolBarButton">
				<object data="../pureUI/icons/tb_plus.svg" aria-label=""></object>
			</button>

			<div class="spacer" data-tauri-drag-region=""></div>

			<button class="toolBarButton">
				<object data="../pureUI/icons/tb_edit.svg" aria-label=""></object>
			</button>
			<button class="toolBarButton">
				<object data="../pureUI/icons/tb_stop.svg" aria-label=""></object>
			</button>
			<button class="toolBarButton">
				<object data="../pureUI/icons/tb_play.svg" aria-label=""></object>
			</button>

			<div class="spacer" data-tauri-drag-region=""></div>

			<button class="toolBarButton">
				<object data="../pureUI/icons/tb_wave.svg" aria-label=""></object>
			</button>

		</div>
		{#if uiPlatform == "win"}
			<WinButtonsMS />
		{/if}
	</div>
</div>
