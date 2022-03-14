<template>
	<div class="playlistItem playing">
		<h1>Title</h1>
		<h2>path of the Track</h2>
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
	height: 50px;
	margin-bottom: 5px;
	padding: 10px;

	background-color: #333;
	border-style: solid;
	border-width: 2px;
	border-color: #333;
	border-radius: 5px;

	&.selected {
		border-color: s.$accent;
		background-color: rgb(51, 51, 51);
	}

	&.playing {
		background-color: s.$accentDark;
		border-color: s.$accentDark;
	}

	&.playing.selected {
		background-color: s.$accentDark;
		border-color: s.$accent;
	}

	h1 {
		font-size: 30px;
		color: white;
	}

	h2 {
		font-size: 15px;
		color: white;
	}
}

</style>
