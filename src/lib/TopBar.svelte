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
	import AppMenuDev from "@/pureUI/components/AppMenuDev.svelte";

	export let showTracklist;
	export let showAnnotations;
	export let showEditor;
	export let showCurrent;
	export let showHotkeys;
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
			<TopBarToggle
				icon="sidebar"
				bind:active={showTracklist}
				activeColor="var(--hover)"
				toolTip="Toggle Tracklist"
				disabled={!$editMode}
			/>

			<!--Annotations-->
			<TopBarToggle
				icon="comment"
				bind:active={showAnnotations}
				activeColor="var(--hover)"
				toolTip="Toggle Annotations"
				disabled={false}
			/>
		</div>

		{#if $uiPlatform == "win"}
			<AppMenu name="File">
				<AppMenuItem id="open" name="Open" accelerator="ctrl O" />
				<AppMenuItem id="save" name="Save" accelerator="ctrl S" />
				<div class="seperator" />
				<AppMenuItem id="settings" name="Settings" accelerator="ctrl ," disabled={!$editMode}/>
			</AppMenu>
			<AppMenu name="Window">
				<AppMenuItem
					id="showTracklist"
					name="Track List"
					checked={showTracklist && $editMode ? "true" : "false"}
					disabled={!$editMode}
				/>
				<AppMenuItem
					id="showAnnotations"
					name="Annotations"
					checked={showAnnotations ? "true" : "false"}
				/>
				<AppMenuItem
					id="showCurrent"
					name="Tracks playing"
					checked={showCurrent ? "true" : "false"}
				/>
				<AppMenuItem
					id="showHotkeys"
					name="Hotkeys"
					checked={showHotkeys ? "true" : "false"}
				/>
				<AppMenuItem
					id="showEditor"
					name="Editor"
					checked={showEditor && $editMode ? "true" : "false"}
					disabled={!$editMode}
				/>
				{#if $settings.video}
					<div class="seperator" />
					<AppMenuItem id="projector" name="Projector" accelerator="ctrl P" />
				{/if}
			</AppMenu>
		{/if}
		{#if $settings.debug}
			<AppMenuDev />
		{/if}

		<div class="spacer" data-tauri-drag-region="" />

		<!--Add Annotation-->
		<TopBarButton
			icon="comment_add"
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
			<TopBarToggle
				icon="cut"
				bind:active={showEditor}
				activeColor="var(--hover)"
				toolTip="Toggle Edior"
				disabled={!$editMode}
			/>

			<!--current playing-->
			<TopBarToggle
				icon="active_play"
				bind:active={showCurrent}
				activeColor="var(--hover)"
				toolTip="Toggle Tracks playing"
				disabled={!$editMode}
			/>

			<!--hotkeys-->
			<TopBarToggle
				icon="hotkeys"
				bind:active={showHotkeys}
				activeColor="var(--hover)"
				toolTip="Toggle Hotkeys"
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
