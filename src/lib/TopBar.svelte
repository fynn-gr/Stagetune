<script>
	import TopBarButton from '../pureUI/components/TopBarButton.svelte';
	import TopBarToggle from '../pureUI/components/TopBarToggle.svelte';
	import AppMenu from '../pureUI/components/AppMenu.svelte'
	import { appWindow } from '@tauri-apps/api/window';

	import { editMode, playlist, selectedItem, uiPlatform } from '@/stores';
	import { openDir } from '@/utils';

	export let sideBar;
	export let editor;
	export let palettes;
	export let zoom;

</script>

<div class="topbar toolbar" data-tauri-drag-region>
	<div class="topbar-container" data-tauri-drag-region>

		{#if $uiPlatform == "mac"}
			<div
				class="win-buttons-mac"
				class:active={$editMode}
				data-tauri-drag-region
			>
				<button
					on:click={() => {
						if ($editMode) {appWindow.close()}
					}}>
					<img src="./src/pureUI/icons/winButtonsMacClose.svg" alt="">
				</button>
				<button 
					on:click={() => {
						if ($editMode) {appWindow.minimize()}
					}}>
					<img src="./src/pureUI/icons/winButtonsMacMin.svg" alt="">
				</button>
				<button
					on:click={() => {
						if ($editMode) {appWindow.toggleMaximize()}
					}}>
					<img src="./src/pureUI/icons/winButtonsMacMax.svg" alt="">
				</button>
			</div>
		{/if}

		<!--Sidebar-->
		
		<TopBarButton
			icon="sidebar"
			onClick={() => {sideBar = !sideBar}}
			toolTip="sideBar"
			disabled={!$editMode}
		/>

		<TopBarButton
			icon="plus"
			onClick={() => {openDir()}}
			toolTip="add Path"
			disabled={!$editMode}
		/>
		

		<AppMenu name="File">
			<button>Open Playlist</button>
		</AppMenu>

		<div class="spacer" data-tauri-drag-region=""></div>

		<div class="toolbar-group">

			<!--Add Annotation-->
			<TopBarButton
				icon="comment"
				onClick={() => {
					if ($selectedItem == null) {
						playlist.update(e => {
							e.push({type: "annotation", text: "Comment"})
							return e;
						})
					} else {
						playlist.update(e => {
							e.splice($selectedItem + 1, 0, {type: "annotation", text: "Comment"})
							return e;
						})
					}
					console.log($playlist)
				}}
				toolTip="add comment"
			/>

			<!--Comment Before-->
			<TopBarToggle
				icon="comment_before"
				active={$playlist[$selectedItem] != undefined && $playlist[$selectedItem].annotation[0] != null}
				onChange={(active) => {
					playlist.update(items => {
						items[$selectedItem].annotation[0] = active ? "Comment" : null;
						return items;
					})
				}}
				activeColor="rgb(0, 108, 141)"
				toolTip="toggle comment before"
			/>

			<TopBarToggle
				icon="comment_after"
				active={$playlist[$selectedItem] != undefined && $playlist[$selectedItem].annotation[1] != null}
				onChange={(active) => {
					playlist.update(items => {
						items[$selectedItem].annotation[1] = active ? "Comment" : null;
						return items;
					})
				}}
				activeColor="rgb(0, 108, 141)"
				toolTip="toggle comment after"
			/>

		</div>

		<div class="spacer-fix" data-tauri-drag-region=""></div>

		<!--Lock-->
		<TopBarToggle
			icon="lock"
			iconActive="lock_open"
			bind:active={$editMode}
			activeColor="#c22"
			toolTip="edit Mode"
		/>


		<!--stop All
		<TopBarButton
			icon="stop"
			onClick={() => {
				/*
				$playlist.forEach(e => {
					console.log(e)
					if (e.type == "track") {
						e.playing = false;
						e.state = 0;
					}
				})*/
			}}
			toolTip="stop everything playing"
		/>
		-->


		<input type="range" min={1} max={2.0} bind:value={zoom} step={0.1}>


		<div class="spacer" data-tauri-drag-region=""></div>

		<!--editor-->
		<TopBarButton
			icon="cut"
			onClick={() => {editor = !editor}}
			toolTip="Editor"
			disabled={!$editMode}
		/>

		<!--palettes-->
		<TopBarButton
			icon="properties"
			onClick={() => {palettes = !palettes}}
			toolTip="Editor"
			disabled={!$editMode}
		/>


		{#if $uiPlatform == "win"}
			<div class="win-buttons-ms" data-tauri-drag-region>
				<button
					on:click={() => {
						if ($editMode) {appWindow.minimize()}
					}}>
					<img src="./src/pureUI/icons/winButtonsMSMin.svg">
				</button>
				<button
					on:click={() => {
						if ($editMode) {appWindow.toggleMaximize()}
					}}>
					<img src="./src/pureUI/icons/winButtonsMSMax.svg">
				</button>
				<button
					on:click={() => {
						if ($editMode) {appWindow.close()}
					}}>
					<img src="./src/pureUI/icons/winButtonsMSClose.svg">
				</button>
			</div>
		{/if}

	</div>
</div>
