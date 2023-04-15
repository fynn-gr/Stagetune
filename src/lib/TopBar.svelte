<script>
	import TopBarButton from '../../pureUI/components/TopBarButton.svelte';
	import TopBarToggle from '../../pureUI/components/TopBarToggle.svelte';
	import AppMenu from '../../pureUI/components/AppMenu.svelte'
	import WinButtonsMac from '../../pureUI/components/WinButtonsMac.svelte'
	import WinButtonsMS from '../../pureUI/components/WinButtonsMS.svelte'
  import TopBarSwitch from '../../pureUI/components/TopBarSwitch.svelte';

	export let uiPlatform;
	export let sideBar;
	export let editor;
	export let palettes;
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
				{uiPlatform}
				icon="sidebar"
				onClick={() => {sideBar = !sideBar}}
				toolTip="sideBar"
				disabled={!editMode}
			/>

			<AppMenu name="File">
				<button>Open Playlist</button>
			</AppMenu>

			<div class="spacer" data-tauri-drag-region=""></div>

			<div class="toolBarGroup">

				<TopBarButton
					{uiPlatform}
					icon="comment"
					onClick={() => {}}
					toolTip="add comment"
				/>
	
				<TopBarToggle
					{uiPlatform}
					icon="comment_before"
					active={false}
					activeColor="rgb(0, 108, 141)"
					toolTip="toggle comment before"
				/>
	
				<TopBarToggle
					{uiPlatform}
					icon="comment_after"
					active={false}
					activeColor="rgb(0, 108, 141)"
					toolTip="toggle comment after"
				/>

			</div>

			<div class="spacerFix" data-tauri-drag-region=""></div>

			<!--Lock-->
			<TopBarToggle
				{uiPlatform}
				icon="lock"
				iconActive="lock_open"
				bind:active={editMode}
				activeColor="#c22"
				toolTip="edit Mode"
			/>

			<!--stop all-->
			<TopBarButton
				{uiPlatform}
				icon="stop"
				onClick={() => {}}
				toolTip="stop everything playing"
			/>


			<input type="range" min={1} max={2.4} bind:value={zoom} step={0.2}>


			<div class="spacer" data-tauri-drag-region=""></div>

			<!--editor-->
			<TopBarButton
				{uiPlatform}
				icon="cut"
				onClick={() => {editor = !editor}}
				toolTip="Editor"
				disabled={!editMode}
			/>

		
			<!--palettes-->
			<TopBarButton
				{uiPlatform}
				icon="properties"
				onClick={() => {palettes = !palettes}}
				toolTip="Editor"
				disabled={!editMode}
			/>

		</div>

		{#if uiPlatform == "win"}
			<WinButtonsMS />
		{/if}

	</div>
</div>
