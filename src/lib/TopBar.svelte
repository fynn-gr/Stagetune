<script>
	import TopBarButton from '../../pureUI/components/TopBarButton.svelte';
	import TopBarToggle from '../../pureUI/components/TopBarToggle.svelte';
	import AppMenu from '../../pureUI/components/AppMenu.svelte'
	import WinButtonsMac from '../../pureUI/components/WinButtonsMac.svelte'
	import WinButtonsMS from '../../pureUI/components/WinButtonsMS.svelte'

	export let uiPlatform;
	export let sideBar;
	export let editor;
	export let editMode;
	export let zoom;

</script>

<div class="topBar toolBar" data-tauri-drag-region>
	<div class="topBarContainer" data-tauri-drag-region>

		{#if uiPlatform == "mac"}
			<WinButtonsMac />
		{/if}

		<div class="topBarContent" data-tauri-drag-region>

			<!--Sidebar-->
			<TopBarButton
				icon="../pureUI/icons/tb_mac/sidebar.svg"
				onClick={() => {sideBar = !sideBar}}
				toolTip="sideBar"
				disabled={!editMode}
			/>

			<AppMenu name="File">
				<button>Open Playlist</button>
			</AppMenu>


			<div class="spacer" data-tauri-drag-region=""></div>


			<TopBarButton
				icon="../pureUI/icons/tb_mac/comment.svg"
				onClick={() => {}}
				toolTip="add comment"
			/>

			<TopBarToggle
				icon="../pureUI/icons/tb_mac/comment_before.svg"
				active={false}
				activeColor="rgb(0, 108, 141)"
				toolTip="toggle comment before"
			/>

			<TopBarToggle
				icon="../pureUI/icons/tb_mac/comment_after.svg"
				active={false}
				activeColor="rgb(0, 108, 141)"
				toolTip="toggle comment after"
			/>


			<div class="spacerFix" data-tauri-drag-region=""></div>


			<!--Lock-->
			<TopBarToggle
				icon="../pureUI/icons/tb_mac/lock.svg"
				iconActive="../pureUI/icons/tb_mac/lock_open.svg"
				bind:active={editMode}
				activeColor="#c22"
				toolTip="edit Mode"
			/>

			<!--stop all-->
			<TopBarButton
				icon="../pureUI/icons/tb_mac/stop.svg"
				onClick={() => {}}
				toolTip="stop everything playing"
			/>


			<input type="range" min={1} max={2.4} bind:value={zoom} step={0.2}>


			<div class="spacer" data-tauri-drag-region=""></div>


			<!--editor-->
			<TopBarButton
				icon="../pureUI/icons/tb_mac/properties.svg"
				onClick={() => {editor = !editor}}
				toolTip="Editor"
				disabled={!editMode}
			/>

		</div>

		{#if uiPlatform == "win"}
			<WinButtonsMS />
		{/if}

	</div>
</div>
