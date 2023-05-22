<script lang="ts">
	import { editMode } from '../stores';

	export let text: string;
	export let selectedItem: number;
	export let id: number

</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="playlistAnotation"
	class:selected={selectedItem == id}
	on:click={(e) => {
		selectedItem = id;
	}}>

	<p contenteditable={$editMode}>{text}</p>

</div>
