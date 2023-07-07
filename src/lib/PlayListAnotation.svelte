<script lang="ts">
	import { editMode, selectedItem } from '../stores';

	export let text: string;
	export let id: number

</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="playlistAnotation"
	class:selected={$selectedItem == id}
	on:click={(e) => {
		selectedItem.set(id);
	}}>

	<p contenteditable={$editMode && $selectedItem == id}>{text}</p>

</div>
