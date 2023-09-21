<script>
	import TopBarButton from "../pureUI/components/TopBarButton.svelte";
	import TopBarToggle from "../pureUI/components/TopBarToggle.svelte";
	import AppMenu from "../pureUI/components/AppMenu.svelte";
	import { appWindow } from "@tauri-apps/api/window";
	import { confirm } from "@tauri-apps/api/dialog";

	import { editMode, playlist, selectedItem, uiPlatform } from "@/stores";
	import { openDir } from "@/utils";

	export let sideBar;
	export let editor;
	export let palettes;
	//let zoom = 1.4
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
					on:click={async () => {
						if ($editMode) {
							const confirmed = await confirm("Discard all unsaved changes?", {
								title: "Quit?",
								type: "warning",
								okLabel: "Quit",
							}).then((isOK) => (isOK ? appWindow.close() : null));
						}
					}}
				>
					<img src="./icons/winButtonsMacClose.svg" alt="close" />
				</button>
				<button
					on:click={() => {
						if ($editMode) {
							appWindow.minimize();
						}
					}}
				>
					<img src="./icons/winButtonsMacMin.svg" alt="minimize" />
				</button>
				<button
					on:click={() => {
						if ($editMode) {
							appWindow.toggleMaximize();
						}
					}}
				>
					<img src="./icons/winButtonsMacMax.svg" alt="maximize" />
				</button>
			</div>
		{/if}

		<div class="group">
			<!--Sidebar-->
			<TopBarButton
				icon="sidebar"
				onClick={() => {
					sideBar = !sideBar;
				}}
				toolTip="sideBar"
				disabled={!$editMode}
			/>
		</div>

		{#if $uiPlatform == "win"}
			<AppMenu name="File">
				<button>Open Playlist</button>
			</AppMenu>
		{/if}

		<div class="spacer" data-tauri-drag-region="" />

		<div class="toolbar-group">
			<!--Add Annotation-->
			<TopBarButton
				icon="comment"
				disabled={!$editMode}
				onClick={() => {
					if ($selectedItem == null) {
						playlist.update((e) => {
							e.push({
								type: "annotation",
								origin: "playlist",
								text: "Comment",
							});
							return e;
						});
					} else {
						playlist.update((e) => {
							e.splice($selectedItem + 1, 0, {
								type: "annotation",
								origin: "playlist",
								text: "Comment",
							});
							return e;
						});
					}
					console.log($playlist);
				}}
				toolTip="add comment"
			/>

			<!--Comment Before-->
			<TopBarToggle
				icon="comment_before"
				disabled={!$editMode}
				active={$playlist[$selectedItem] != undefined &&
					$playlist[$selectedItem].type != "annotation" &&
					$playlist[$selectedItem].annotation.before != null}
				onChange={(active) => {
					playlist.update((items) => {
						items[$selectedItem].annotation.before = active ? "Comment" : null;
						return items;
					});
				}}
				activeColor="rgb(0, 108, 141)"
				toolTip="toggle comment before"
			/>

			<TopBarToggle
				icon="comment_after"
				disabled={!$editMode}
				active={$playlist[$selectedItem] != undefined &&
					$playlist[$selectedItem].type != "annotation" &&
					$playlist[$selectedItem].annotation.after != null}
				onChange={(active) => {
					playlist.update((items) => {
						items[$selectedItem].annotation.after = active ? "Comment" : null;
						return items;
					});
				}}
				activeColor="rgb(0, 108, 141)"
				toolTip="toggle comment after"
			/>
		</div>

		<div class="spacer-fix" data-tauri-drag-region="" />

		<!--Lock-->
		<TopBarToggle
			icon="lock"
			iconActive="lock_open"
			bind:active={$editMode}
			activeColor="var(--secondary)"
			toolTip="edit Mode"
		/>

		<!--
		<input
			type="range"
			min={1}
			max={2.0}
			bind:value={zoom}
			step={0.1}
			on:change={() => {
				console.log(zoom)
				//document.documentElement.style.fontSize = `${0.1}px`;
				//document.documentElement.style.fontSize = `${10}px`;
				document.documentElement.style.fontSize = `${zoom}px`;

				document.body.focus();
			}}
		/>
		-->

		<!--
		<select
			bind:value={zoom}
			on:change={() => {
				//console.log(zoom)
				document.documentElement.style.fontSize = `${0.1}px`;
				document.documentElement.style.fontSize = `${10}px`;
				document.documentElement.style.fontSize = `${zoom}px`;

				document.body.focus();
			}}
		>
			<option value="1">100%</option>
			<option value="1.2">120%</option>
			<option value="1.4">140%</option>
			<option value="1.8">180%</option>
		</select>
		-->

		<div class="spacer" data-tauri-drag-region="" />

		<div class="group">
			<!--editor-->
			<TopBarButton
				icon="cut"
				onClick={() => {
					editor = !editor;
				}}
				toolTip="Editor"
				disabled={!$editMode}
			/>

			<!--palettes-->
			<TopBarButton
				icon="properties"
				onClick={() => {
					palettes = !palettes;
				}}
				toolTip="Editor"
				disabled={!$editMode}
			/>
		</div>

		{#if $uiPlatform == "win"}
			<div class="win-buttons-ms" data-tauri-drag-region>
				<button
					on:click={() => {
						if ($editMode) {
							appWindow.minimize();
						}
					}}
				>
					<img src="./icons/winButtonsMSMin.svg" alt="minimize" />
				</button>
				<button
					on:click={() => {
						if ($editMode) {
							appWindow.toggleMaximize();
						}
					}}
				>
					<img src="./icons/winButtonsMSMax.svg" alt="maximise" />
				</button>
				<button
					on:click={() => {
						if ($editMode) {
							appWindow.close();
						}
					}}
				>
					<img src="./icons/winButtonsMSClose.svg" alt="close" />
				</button>
			</div>
		{/if}
	</div>
</div>
