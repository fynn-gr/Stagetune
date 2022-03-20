<template>
	<div class="playlistAnotation">
		<p contenteditable="true">Pause - Bühne umbauen, dann nach oben gehen, nicht vergessen auf die Uhr zu schauen und dann mit einer Cola aufs Sofa setzen</p>
	</div>
</template>




<script>
export default {
	name: 'playlistAnotation',
	props: {
		name: String,
	}
}
</script>




<style scoped lang="scss">

@use '../style.scss' as s;

.playlistAnotation {
	margin-bottom: 5px;
	padding: 5px 10px 7px 10px;

	background-color: rgb(124, 155, 41);
	border-style: solid;
	border-width: 3px;
	border-color: rgb(29, 29, 29);
	border-radius: 8px;

	&.selected {
		border-color: s.$accent;
	}

	p {
		width: 100%;
		font-size: 1.5rem;
		text-align: left;
		color: white;
		background-color: transparent;
	}
}

</style>
