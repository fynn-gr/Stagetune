<script lang="ts">
	export let text:String;
	export let selected:boolean;
</script>


<div class="playlistAnotation" class:selected={selected}>
	<p contenteditable="true">{text}</p>
</div>
