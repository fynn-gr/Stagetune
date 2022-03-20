<template>
	<div class="playlistItem">
		<div class="annotationStart">
			<p contenteditable="true">Auftritt Theo und Berni</p>
		</div>
		<div class="wrapper">
			<p class="number">1</p>
			<p class="title">Händel - Der Messias 3 - Der Chor Loop</p>
			<p class="location">Alte Schule > Messias</p>
			<p class="length">2:38</p>
			<div class="fadeIn">
				<p>Fade in:</p>
				<input type="number" value="0" min="0">
			</div>
			<div class="fadeOut">
				<p>Fade out:</p>
				<input type="number" value="0" min="0">
			</div>
			<div class="volume">
				<p class="label">V</p>
				<input type="range" value="100"/>
				<p class="label"></p>
			</div>
			<div class="balance">
				<p class="label">L</p>
				<input type="range" value="50"/>
				<p class="label">R</p>
			</div>
		</div>
		<div class="annotationEnd">
			<p contenteditable="true">auf Zeichen</p>
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
@use '../../../pureUI/scss/index.scss' as p;
.playlistItem {
	position: relative;
	box-sizing: border-box;
	margin-bottom: 5px;

	border-style: solid;
	border-color: rgb(29, 29, 29);
	border-width: 3px;
	border-radius: 8px;

	&.selected {
		border-color: s.$accent;
	}

	&.playing {
		.annotationStart {
			background-color: s.$accentDarker;
		}

		.wrapper {
			background-color: s.$accentDark;
		}

		.annotationEnd {
			background-color: s.$accentDarker;
		}
	}

	&.missing {
		.annotationStart {
			background-color: #aa0000;

			* {
				color: rgb(66, 66, 66) !important;
			}
		}

		.wrapper {
			background-color: #dd0000;

			* {
				color: rgb(66, 66, 66) !important;
			}
		}

		.annotationEnd {
			background-color: #aa0000;

			* {
				color: rgb(66, 66, 66) !important;
			}
		}
	}

	.wrapper {
		position: relative;
		box-sizing: border-box;
		z-index: 10;
		height: 60px;

		display: grid;
		grid-template-columns: 18px 1fr 55px 130px 200px;
		grid-template-rows: 50% 10% 40%;
		grid-column-gap: 25px;
		grid-template-areas: 	'number title    length fadeIn  volume '
								'number title    length fadeOut balance'
								'number location length fadeOut balance ';

		background-color: p.$areaBG2;
		border-radius: 5px;
		box-shadow: 0px 0px 5px rgb(37, 37, 37);

		.number {
			-webkit-user-select: none;
			grid-area: number;
			width: 43px;
			padding: 15px 0px;

			text-align: center;
			font-size: 2rem;
			font-weight: bold;
		}

		.title {
			-webkit-user-select: none;
			grid-area: title;
			padding: 5px 0px 0px 10px;
			text-overflow: clip;
			overflow: hidden;

			font-size: 2rem;
			font-weight: bold;
			color: white;
		}

		.location {
			-webkit-user-select: none;
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

		.fadeIn {
			display: flex;
			flex-direction: row;
			height: 30px;
			padding: 0px;

			p {
				width: 70px;
				margin: auto 0px;
				font-size: 1.2rem;
			}

			input {
				width: 60px;
				margin: auto 0px;
			}
		}

		.fadeOut {
			display: flex;
			flex-direction: row;
			height: 30px;
			padding: 0px;

			p {
				width: 70px;
				margin: auto 0px;
				font-size: 1.2rem;
			}

			input {
				width: 60px;
				margin: auto 0px;
			}
		}

		.volume {
			grid-area: volume;
			display: flex;
			flex-direction: row;
		}

		.balance {
			grid-area: balance;
			display: flex;
			flex-direction: row;
		}

		input[type=range] {
			width: calc(100% - 40px);
			height: 6px;
			margin: auto 0px;

			-webkit-appearance: none;
			outline: none;
			border-radius: 5px;

			&::-webkit-slider-thumb {
				-webkit-appearance: none;
				width: 15px;
				height: 15px;
				border-radius: 50%;
				background-color: s.$accent;
			}
		}

		.label {
			width: 20px;
			margin: auto 0px;
			text-align: center;
		}
	}

	.annotationStart {
		position: relative;
		z-index: 1;
		padding: 5px 10px 10px 10px;
		margin-bottom: -5px;

		background-color: p.$areaBG3;
		border-radius: 5px 5px 0px 0px;

		p {
			width: 100%;
			font-size: 1.5rem;
			text-align: left;
		}
	}

	.annotationEnd {
		position: relative;
		z-index: 1;
		padding: 10px 10px 5px 10px;
		margin-top: -5px;

		background-color: p.$areaBG3;
		border-radius: 0px 0px 5px 5px;

		p {
			width: 100%;
			font-size: 1.5rem;
			text-align: left;
		}
	}
}


</style>
