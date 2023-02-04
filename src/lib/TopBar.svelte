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
				<img src="../pureUI/icons/tb_sidebar.svg" alt="">
			</button>
			<button class="toolBarButton">
				<img src="../pureUI/icons/tb_plus.svg" alt="">
			</button>

			<div class="spacer" data-tauri-drag-region=""></div>

			<button class="toolBarButton">
				<img src="../pureUI/icons/tb_lock.svg" alt="">
			</button>
			<button class="toolBarButton">
				<img src="../pureUI/icons/tb_stop.svg" alt="">
			</button>
			<button class="toolBarButton">
				<img src="../pureUI/icons/tb_play.svg" alt="">
			</button>

			<div class="spacer" data-tauri-drag-region=""></div>

			<button class="toolBarButton">
				<img src="../pureUI/icons/tb_properties.svg" alt="">
			</button>

		</div>
		{#if uiPlatform == "win"}
			<WinButtonsMS />
		{/if}
	</div>
</div>
