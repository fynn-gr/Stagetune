<script lang="ts">
	import { editMode, selectedItem, isEditing } from "@/stores";

	export let id: number;
	export let annotation: { before: string; after: string };
	export let start: boolean; //true if before track, false if after
</script>

{#if annotation[start ? "before" : "after"] != null}
	<div class={start ? "annotationStart" : "annotationEnd"}>
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
			bind:value={annotation[start ? "before" : "after"]}
		/>
	</div>
{/if}
