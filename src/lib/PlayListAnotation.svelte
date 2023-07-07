<script lang="ts">
	import { editMode, selectedItem, isEditing } from "../stores";

	export let item: any;
	export let id: number;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="playlistAnotation"
	class:selected={$selectedItem == id}
	on:click={(e) => {
		selectedItem.set(id);
	}}
>
	<input
		type="text"
		disabled={!$editMode || $selectedItem != id}
		on:focus={() => {
			isEditing.update((e) => e + 1);
		}}
		on:blur={() => {
			isEditing.update((e) => e - 1);
		}}
		bind:value={item.text}
	/>
</div>
