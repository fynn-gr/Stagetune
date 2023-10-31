<script lang="ts">
	import { editMode, selectedItem, isEditing, uiPlatform } from "@/stores";

	export let id: number;
	export let annotation: string;
</script>

{#if annotation != null}
	<div class="annotation-attached">
		<input
			type="text"
			disabled={!$editMode || $selectedItem != id}
			on:focus={() => {
				isEditing.update(e => e + 1);
				console.log("in focus", $isEditing);
			}}
			on:blur={() => {
				isEditing.update(e => e - 1);
				console.log("out of focus", $isEditing);
			}}
			bind:value={annotation}
		/>
	</div>
{:else}
	<div class="annotation-placeholder">
		<button
			class="add-annotation"
			on:click={e => {
				annotation = "Annotation";
			}}
		>
			<img src={`./icons/tb_${$uiPlatform}/comment.svg`} alt="" />
		</button>
	</div>
{/if}
