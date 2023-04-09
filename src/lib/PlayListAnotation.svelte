<script lang="ts">

	export let text: string;
	export let selected: boolean;
	export let editMode: boolean;
	export let deselectAll = () => {};

</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="playlistAnotation"
	class:selected={selected}
	on:click={(e) => {
		console.log(e)
		if(e.shiftKey == false) { deselectAll() }
		selected = true;
	}}>

	<p contenteditable={editMode}>{text}</p>

</div>
