<script lang="ts">
import {
	editMode,
	isEditing,
	contextMenu,
	selectedItem,
	playlist,
} from "@/ts/Stores.svelte";
import { onMount, tick } from "svelte";

interface Props {
	id: number;
	annotation: { text: string; color: string | null } | null;
}
let { id, annotation = $bindable() }: Props = $props();

// svelte-ignore non_reactive_update
let annotationEl: HTMLElement;
let annotationIsEditing = $state(false);

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
							icon: "./icons/app_menu/x.svg",
							iconColor: false,
							action: () => {
								annotation = null;
							},
						},
						{},
						{
							name: "Gray",
							icon: "./icons/app_menu/gray.svg",
							iconColor: true,
							action: () => {
								annotation.color = null;
							},
						},
						{
							name: "Red",
							icon: "./icons/app_menu/red.svg",
							iconColor: true,
							action: () => {
								annotation.color = "hsl(5, 54%, 33%)";
							},
						},
						{
							name: "Orange",
							icon: "./icons/app_menu/orange.svg",
							iconColor: true,
							action: () => {
								annotation.color = "hsl(25.4deg 66% 37%)";
							},
						},
						{
							name: "Green",
							icon: "./icons/app_menu/green.svg",
							iconColor: true,
							action: () => {
								annotation.color = "hsl(102deg 62% 30%)";
							},
						},
						{
							name: "Teal",
							icon: "./icons/app_menu/teal.svg",
							iconColor: true,
							action: () => {
								annotation.color = "hsl(169.44deg 62% 30%)";
							},
						},
						{
							name: "Blue",
							icon: "./icons/app_menu/blue.svg",
							iconColor: true,
							action: () => {
								annotation.color = "hsl(205.44deg 62% 30%)";
							},
						},
						{
							name: "Purple",
							icon: "./icons/app_menu/purple.svg",
							iconColor: true,
							action: () => {
								annotation.color = "hsl(274.67deg 53.55% 26.67%)";
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
		{#if annotationIsEditing}
			<input
				class="annotation-input"
				type="text"
				bind:this={annotationEl}
				bind:value={annotation.text}
				onblur={() => {
					annotationIsEditing = false;
					isEditing.update(e => e - 1);
				}}
				onkeydown={e => {
					if (e.key === "Enter") {
						annotationIsEditing = false;
					}
				}}
			/>
		{:else}
			<span
				class="annotation-display"
				ondblclick={() => {
					if (!$editMode) return;
					annotationIsEditing = true;
					isEditing.update(e => e + 1);
					tick().then(() => {
						annotationEl.focus();
					});
				}}>{annotation.text}</span
			>
		{/if}
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
				<img src={`./icons/topbar/write.svg`} alt="" />
			</button>
		{/if}
	</div>
{/if}
