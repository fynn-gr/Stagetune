<template>
	<div class="playlistItem">
		<h1>Händel - Der Messias 3 - Der Chor Loop</h1>
		<h2>Alte Schule > Messias</h2>
	</div>
</template>




<script>
export default {
	name: 'playlistItem',
	props: {
		name: String,
		selected: Boolean
	},
	created () {
		
	}
}
</script>




<style scoped lang="scss">

@use '../style.scss' as s;

.playlistItem {
	box-sizing: border-box;
	height: 80px;
	margin-bottom: 5px;
	padding: 10px;

	background-color: #333;
	border-style: none;
	border-width: 2px;
	border-radius: 5px;

	&.selected {
		border-style: solid;
		border-color: s.$accent;
		background-color: rgb(51, 51, 51);
	}

	&.playing {
		border-style: none;
		background-color: s.$accentDark;
	}

	&.missing {
		background-color: #dd0000;
	}

	h1 {
		height: 34px;
		text-overflow: clip;
		overflow: hidden;

		font-size: 30px;
		color: white;
	}

	h2 {
		height: 17px;
		text-overflow: clip;
		overflow: hidden;

		font-size: 15px;
		color: white;
	}
}

</style>
