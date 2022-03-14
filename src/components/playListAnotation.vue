<template>
	<div class="playlistAnotation">
		<p contenteditable="true">Pause - Bühne umbauen, dann nach oben gehen, nicht vergessen auf die Uhr zu schauen und dann mit einer Cola aufs Sofa setzen</p>
	</div>
</template>




<script>
export default {
	name: 'playListAnotation',
	props: {
		name: String,
	}
}
</script>




<style scoped lang="scss">

@use '../style.scss' as s;

.playlistAnotation {
	margin-bottom: 5px;
	padding: 10px;

	background-color: rgb(124, 155, 41);
	border-radius: 5px;

	p {
		font-size: 1.3rem;
		color: white;
	}
}

</style>
