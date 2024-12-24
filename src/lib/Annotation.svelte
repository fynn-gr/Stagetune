<script lang="ts">
import {
	editMode,
	isEditing,
	contextMenu,
	selectedItem,
	playlist,
} from "@/ts/Stores";
import { onMount } from "svelte";

interface Props {
	id: number,
	annotation: { text: string; color: string | null } | null
}
let { id, annotation = $bindable() }: Props = $props();

// svelte-ignore non_reactive_update
let annotationEl: HTMLElement;

onMount(() => {
	if (annotation != null) annotationEl.innerHTML = annotation.text;
});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
{#if annotation != null}
	<div
		class="annotation-attached"
		style={`background: ${annotation.color};`}
		oncontextmenu={e => {
			if ($editMode) {
				$contextMenu = {
					position: { x: e.clientX, y: e.clientY },
					content: [
						{
							name: "Delete Annotation",
							icon: "./icons/menu_win/x.svg",
							action: () => {
								annotation = null;
							},
						},
						{},
						{
							name: "Gray",
							icon: "./icons/menu_win/gray.svg",
							iconColor: true,
							action: () => {
								$playlist[id].annotation.color = null;
							},
						},
						{
							name: "Red",
							icon: "./icons/menu_win/red.svg",
							iconColor: true,
							action: () => {
								$playlist[id].annotation.color = "hsl(5, 54%, 33%)";
							},
						},
						{
							name: "Orange",
							icon: "./icons/menu_win/orange.svg",
							iconColor: true,
							action: () => {
								$playlist[id].annotation.color = "hsl(25.4deg 66% 37%)";
							},
						},
						{
							name: "Green",
							icon: "./icons/menu_win/green.svg",
							iconColor: true,
							action: () => {
								$playlist[id].annotation.color = "hsl(102deg 62% 30%)";
							},
						},
						{
							name: "Teal",
							icon: "./icons/menu_win/teal.svg",
							iconColor: true,
							action: () => {
								$playlist[id].annotation.color = "hsl(169.44deg 62% 30%)";
							},
						},
						{
							name: "Blue",
							icon: "./icons/menu_win/blue.svg",
							iconColor: true,
							action: () => {
								$playlist[id].annotation.color = "hsl(205.44deg 62% 30%)";
							},
						},
						{
							name: "Purple",
							icon: "./icons/menu_win/purple.svg",
							iconColor: true,
							action: () => {
								$playlist[id].annotation.color = "hsl(274.67deg 53.55% 26.67%)";
							},
						},
					],
				};
				console.log($contextMenu, e);
			}
		}}
		onclick={e => {
			//e.stopPropagation();
		}}
	>
		<div
			class="input"
			contenteditable={$selectedItem == id && $editMode}
			bind:this={annotationEl}
			onfocus={e => {
				isEditing.update(e => e + 1);
			}}
			onblur={() => {
				isEditing.update(e => e - 1);
				annotation!.text = annotationEl.innerHTML;
			}}
		>
			{@html annotation.text}
		</div>
	</div>
{:else}
	<div class="annotation-placeholder">
		{#if $editMode}
			<button
				id="btn-add-attached-anotation"
				class="add-annotation"
				title="Add attached anotation"
				onclick={e => {
					annotation = { text: "Annotation", color: null };
				}}
			>
				<img src={`./icons/top_bar/write.svg`} alt="" />
			</button>
		{/if}
	</div>
{/if}
