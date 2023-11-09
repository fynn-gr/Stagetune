<script lang="ts">
	import {
		editMode,
		isEditing,
		uiPlatform,
		contextMenu,
		selectedItem,
		playlist,
	} from "@/stores";

	export let id: number;
	export let annotation: { text: string; color: string };

	let annotationEl: HTMLElement;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if annotation != null}
	<div
		class="annotation-attached"
		style={`background: ${annotation.color};`}
		on:contextmenu={e => {
			if ($editMode) {
				$contextMenu = {
					position: { x: e.clientX, y: e.clientY },
					content: [
						{
							name: "Remove Annotation",
							action: () => {
								annotation = null;
							},
						},
						{},
						{
							name: "gray",
							icon: "./icons/menu_win/gray.svg",
							action: () => {
								$playlist[id].annotation.color = null;
							},
						},
						{
							name: "Red",
							icon: "./icons/menu_win/red.svg",
							action: () => {
								$playlist[id].annotation.color = "hsl(5, 54%, 33%)";
							},
						},
						{
							name: "Orange",
							icon: "./icons/menu_win/orange.svg",
							action: () => {
								$playlist[id].annotation.color = "hsl(25.4deg 66% 37%)";
							},
						},
						{
							name: "Green",
							icon: "./icons/menu_win/green.svg",
							action: () => {
								$playlist[id].annotation.color = "hsl(102deg 62% 30%)";
							},
						},
						{
							name: "Teal",
							icon: "./icons/menu_win/teal.svg",
							action: () => {
								$playlist[id].annotation.color = "hsl(169.44deg 62% 30%)";
							},
						},
						{
							name: "Blue",
							icon: "./icons/menu_win/blue.svg",
							action: () => {
								$playlist[id].annotation.color = "hsl(205.44deg 62% 30%)";
							},
						},
						{
							name: "Purple",
							icon: "./icons/menu_win/purple.svg",
							action: () => {
								$playlist[id].annotation.color = "hsl(274.67deg 53.55% 26.67%)";
							},
						},
					],
				};
				console.log($contextMenu, e);
			}
		}}
		on:click={e => {
			e.stopPropagation();
		}}
	>
		<div
			class="input"
			contenteditable={$selectedItem == id && $editMode}
			bind:this={annotationEl}
			on:focus={e => {
				isEditing.update(e => e + 1);
			}}
			on:blur={() => {
				isEditing.update(e => e - 1);
				annotation.text = annotationEl.innerText;
			}}
		>
			<p>{annotation.text}</p>
		</div>
	</div>
{:else}
	<div class="annotation-placeholder">
		{#if $editMode}
			<button
				class="add-annotation"
				title="Add attached anotation"
				on:click={e => {
					annotation = { text: "Annotation", color: null };
				}}
			>
				<img src={`./icons/tb_${$uiPlatform}/plus.svg`} alt="" />
			</button>
		{/if}
	</div>
{/if}
