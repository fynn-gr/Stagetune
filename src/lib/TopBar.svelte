<script>
	import TopBarButton from "../pureUI/components/TopBarButton.svelte";
	import TopBarToggle from "../pureUI/components/TopBarToggle.svelte";
	import AppMenu from "../pureUI/components/AppMenu.svelte";
	import { appWindow } from "@tauri-apps/api/window";
	import { confirm } from "@tauri-apps/api/dialog";

	import {
		editMode,
		playlist,
		selectedItem,
		settings,
		uiPlatform,
	} from "@/stores";
	import WinButtonsMac from "@/pureUI/components/WinButtonsMac.svelte";
	import ModeSwitch from "./ModeSwitch.svelte";
	import WinButtonsMs from "@/pureUI/components/WinButtonsMS.svelte";
	import AppMenuItem from "@/pureUI/components/AppMenuItem.svelte";

	export let sideBar;
	export let annotations;
	export let editor;
	export let palettes;
	export let pauseAll;
	export let resetAll;
</script>

<div class="topbar toolbar" data-tauri-drag-region>
	<div class="topbar-container" data-tauri-drag-region>
		{#if $uiPlatform == "mac"}
			<WinButtonsMac
				onClose={async () => {
					if ($editMode) {
						const confirmed = await confirm("Discard all unsaved changes?", {
							title: "Quit?",
							type: "warning",
							okLabel: "Quit",
						}).then(isOK => (isOK ? appWindow.close() : null));
					}
				}}
				onMin={() => {
					if ($editMode) {
						appWindow.minimize();
					}
				}}
				onMax={() => {
					if ($editMode) {
						appWindow.toggleMaximize();
					}
				}}
				CanMinimize={$editMode}
				CanMaximise={$editMode}
				CanClose={$editMode}
			/>
		{/if}

		<div class="group">
			<!--Sidebar-->
			<TopBarButton
				icon="sidebar"
				onClick={() => {
					sideBar = !sideBar;
				}}
				toolTip="Toggle SideBar"
				disabled={!$editMode}
			/>

			<!--Annotations-->
			<TopBarButton
				icon="comment"
				onClick={() => {
					annotations = !annotations;
				}}
				toolTip="Toggle Annotations"
				disabled={false}
			/>
		</div>

		{#if $uiPlatform == "win"}
			<AppMenu name="File">
				<AppMenuItem id="new" name="New Playlist" accelerator="ctrl N" />
				<AppMenuItem id="open" name="Open" accelerator="ctrl O" />
				<AppMenuItem id="save" name="Save" accelerator="ctrl S" />
				<div class="seperator" />
				<AppMenuItem id="settings" name="Settings" accelerator="ctrl ," />
			</AppMenu>
			<AppMenu name="Window">
				<AppMenuItem
					id="tracklist"
					name="Track List"
					checked={sideBar ? "true" : "false"}
					disabled={!$editMode}
				/>
				<AppMenuItem
					id="annotations"
					name="Annotations"
					checked={annotations ? "true" : "false"}
				/>
				<AppMenuItem
					id="palettes"
					name="Palettes"
					checked={palettes ? "true" : "false"}
				/>
				<AppMenuItem
					id="editor"
					name="Editor"
					checked={editor ? "true" : "false"}
					disabled={!$editMode}
				/>
				{#if $settings.video}
					<div class="seperator" />
					<AppMenuItem id="projector" name="Projector" accelerator="ctrl P" />
				{/if}
			</AppMenu>
		{/if}

		<div class="spacer" data-tauri-drag-region="" />

		<!--Add Annotation-->
		<TopBarButton
			icon="comment"
			disabled={!$editMode}
			onClick={() => {
				if ($selectedItem == null) {
					playlist.update(e => {
						e.push({
							type: "annotation",
							origin: "playlist",
							annotation: "Annotation",
						});
						return e;
					});
				} else {
					playlist.update(e => {
						e.splice($selectedItem + 1, 0, {
							type: "annotation",
							origin: "playlist",
							annotation: "Annotation",
						});
						return e;
					});
				}
				console.log($playlist);
			}}
			toolTip="Add comment"
		/>

		<div class="spacer-fix" data-tauri-drag-region="" />

		<!--Lock-->
		<ModeSwitch
			icon="lock"
			iconActive="lock_open"
			bind:active={$editMode}
			activeColor="var(--secondary)"
			toolTip="Toggle Mode"
		/>

		<div class="spacer-fix" data-tauri-drag-region="" />

		<div class="group">
			<!--reset all-->
			<TopBarButton
				icon="reset"
				toolTip="Reset all tracks"
				onClick={resetAll}
			/>

			<!--stop all-->
			<TopBarButton icon="stop" toolTip="Stop all tracks" onClick={pauseAll} />
		</div>

		<div class="spacer" data-tauri-drag-region="" />

		<div class="group">
			<!--editor-->
			<TopBarButton
				icon="cut"
				onClick={() => {
					editor = !editor;
				}}
				toolTip="Toggle Editor"
				disabled={!$editMode}
			/>

			<!--palettes-->
			<TopBarButton
				icon="properties"
				onClick={() => {
					palettes = !palettes;
				}}
				toolTip="Toggle Palettes"
				disabled={!$editMode}
			/>
		</div>

		{#if $uiPlatform == "win"}
			<WinButtonsMs
				onClose={async () => {
					if ($editMode) {
						const confirmed = await confirm("Discard unsaved changes?", {
							title: "Quit?",
							type: "warning",
							okLabel: "Quit",
						}).then(isOK => (isOK ? appWindow.close() : null));
					}
				}}
				onMin={() => {
					if ($editMode) {
						appWindow.minimize();
					}
				}}
				onMax={() => {
					if ($editMode) {
						appWindow.toggleMaximize();
					}
				}}
				CanMinimize={$editMode}
				CanMaximise={$editMode}
				CanClose={$editMode}
			/>
		{/if}
	</div>
</div>
