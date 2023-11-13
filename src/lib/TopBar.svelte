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
	import TopBarPopover from "@/pureUI/components/TopBarPopover.svelte";
	import { test } from "@/test";

	export let showTracklist;
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

		<!--Sidebar-->
		<TopBarToggle
			icon="sidebar"
			bind:active={showTracklist}
			activeColor="var(--hover)"
			toolTip="Toggle Tracklist"
			disabled={!$editMode}
		/>

		{#if $uiPlatform == "win"}
			<AppMenu name="File">
				<AppMenuItem id="open" name="Open" accelerator="ctrl O" />
				<AppMenuItem id="save" name="Save" accelerator="ctrl S" />
				<div class="seperator" />
				<AppMenuItem
					id="settings"
					name="Settings"
					accelerator="ctrl ,"
					disabled={!$editMode}
				/>
			</AppMenu>
			<AppMenu name="Window">
				<AppMenuItem
					id="showTracklist"
					name="Track List"
					checked={showTracklist && $editMode ? "true" : "false"}
					disabled={!$editMode}
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
			<AppMenu name="Dev">
				<button
					class="app-menu-item"
					on:click={() => {
						$uiPlatform = "mac";
					}}
				>
					<p>mac</p>
				</button>
				<button
					class="app-menu-item"
					on:click={() => {
						$uiPlatform = "win";
					}}
				>
					<p>Win</p>
				</button>
				<div class="seperator" />
				<button
					class="app-menu-item"
					on:click={() => {
						test(false);
					}}
				>
					<p>Continuous Test</p>
				</button>
				<button
					class="app-menu-item"
					on:click={() => {
						test(true);
					}}
				>
					<p>Penetration Test</p>
				</button>
			</AppMenu>
		{/if}

		<div class="spacer" data-tauri-drag-region="" />

		<TopBarPopover icon="settings" toolTip="Playlist Settings">
			<span>
				<input
					type="checkbox"
					name=""
					id=""
					bind:checked={$settings.showAnnotations}
				/>
				<p>Annotations</p>
			</span>
			<span>
				<input
					type="checkbox"
					name=""
					id=""
					bind:checked={$settings.showFadeOptions}
				/>
				<p>Fade Options</p>
			</span>
			<span>
				<input
					type="checkbox"
					name=""
					id=""
					bind:checked={$settings.showVolumeOptions}
				/>
				<p>Volume Options</p>
			</span>
			<span>
				<input
					type="checkbox"
					name=""
					id=""
					bind:checked={$settings.allowSkipLive}
				/>
				<p>Skip in Live Mode</p>
			</span>
		</TopBarPopover>

		<div class="spacer-fix" data-tauri-drag-region="" />

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
							annotation: { text: "Annotation", color: null },
						});
						return e;
					});
				} else {
					playlist.update(e => {
						e.splice($selectedItem + 1, 0, {
							type: "annotation",
							origin: "playlist",
							annotation: { text: "Annotation", color: null },
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

		<div class="topbar-group">
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

		<!--editor-->
		<TopBarToggle
			icon="cut"
			bind:active={showEditor}
			activeColor="var(--hover)"
			toolTip="Toggle Edior"
			disabled={!$editMode}
		/>

		<div class="topbar-group">
			<!--current playing-->
			<TopBarToggle
				icon="active_play"
				bind:active={showCurrent}
				activeColor="var(--hover)"
				toolTip="Toggle Tracks playing"
			/>

			<!--hotkeys-->
			<TopBarToggle
				icon="hotkeys"
				bind:active={showHotkeys}
				activeColor="var(--hover)"
				toolTip="Toggle Hotkeys"
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
