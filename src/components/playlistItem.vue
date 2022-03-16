<template>
	<div class="playlistItem">
		<p class="title">Händel - Der Messias 3 - Der Chor Loop</p>
		<p class="location">Alte Schule > Messias</p>
		<p class="length">2:38</p>
		<div class="volume">
			<p class="label">V</p>
			<input type="range"/>
			<p class="label"></p>
		</div>
		<div class="balance">
			<p class="label">L</p>
			<input type="range"/>
			<p class="label">R</p>
		</div>
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
	height: 60px;
	margin-bottom: 5px;

	display: grid;
	grid-template-columns: 60% 10% 30%;
	grid-template-rows: 50% 10% 40%;
	grid-template-areas: 	'title    length volume '
							'title    length balance'
							'location length balance ';

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

	.title {
		grid-area: title;
		padding: 5px 0px 0px 10px;
		text-overflow: clip;
		overflow: hidden;

		font-size: 2rem;
		color: white;
	}

	.location {
		grid-area: location;
		padding: 0px 0px 5px 10px;
		text-overflow: clip;
		overflow: hidden;

		font-size: 1.2rem;
		color: white;
	}

	.length {
		grid-area: length;
		text-align: center;
		line-height: 60px;
		font-size: 1.6rem;
		font-weight: bold;
	}

	.volume {
		grid-area: volume;
	}

	.balance {
		grid-area: balance;
	}

	input[type=range] {
		display: inline-block;
		width: calc(100% - 40px);
		height: 100%;
	}

	.label {
		display: inline-block;
		width: 20px;
		height: 100%;
	}
}

</style>
