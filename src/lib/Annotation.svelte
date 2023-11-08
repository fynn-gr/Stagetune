<script lang="ts">
	import {
		editMode,
		isEditing,
		uiPlatform,
		contextMenu,
		selectedItem,
	} from "@/stores";

	export let id: number;
	export let annotation: string;

	let annotationEl: HTMLElement;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if annotation != null}
	<div
		class="annotation-attached"
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
				annotation = annotationEl.innerText;
			}}
		>
			<p>{annotation}</p>
		</div>
	</div>
{:else}
	<div class="annotation-placeholder">
		{#if $editMode}
			<button
				class="add-annotation"
				title="Add attached anotation"
				on:click={e => {
					annotation = "Annotation";
				}}
			>
				<img src={`./icons/tb_${$uiPlatform}/plus.svg`} alt="" />
			</button>
		{/if}
	</div>
{/if}
