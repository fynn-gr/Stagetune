<template>
	<div class="trafficLightDrag"></div>
	<div class="windowBody">
		<topBar/>
		<playBar/>
		<div class="sideBar">
			<div class="trackList">
				<p class="seperator">Messias</p>
				<trackListItem />
				<trackListItem :selected="true"/>
				<trackListItem />
				<p class="seperator">Alte Schule</p>
				<trackListItem />
				<trackListItem />
				<trackListItem />
				<trackListItem />
				<trackListItem />
				<trackListItem />
				<trackListItem />
				<trackListItem />
				<trackListItem />
				<trackListItem />
				<trackListItem />
				<trackListItem />
				<trackListItem />
				<trackListItem />
				<trackListItem />
				<trackListItem />
				<trackListItem />
				<trackListItem />

			</div>
		</div>
		<div class="playList">
			<playlist-item />
			<playlist-item />
			<playlist-item />
			<playListAnotation />
			<playlist-item />
			<playlist-item />
			<playlist-item />
			<playlist-item />
		</div>
		<div class="properties">
			<p>Meters (stereo)
			<br>Details
			<br>
			</p>
		</div>
	</div>
</template>




<script>
import playlistItem      from "./components/playlistItem.vue";
import playListAnotation from "./components/playListAnotation";
import trackListItem     from "./components/trackListItem.vue";
import playBar 		     from "./components/playBar.vue";
import topBar 		     from "./components/topBar.vue";


export default {
	name: "App",
	components: {
		playlistItem,
		playListAnotation,
		trackListItem,
		topBar,
		playBar
	},
};
</script>




<style lang="scss">

@use '../pureUI/scss/index.scss' as p;
@font-face {
	font-family: OpenSans-reg;
	src: url("../public/OpenSans-Regular.ttf");
}

* {
	font-family: "OpenSans-reg", Times, serif;
}

#app {
	font-size: 10px;
	box-sizing: border-box;

	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.windowBody {
	grid-template-columns: 400px 1fr 200px;
	grid-template-rows: 50px 70px 1fr;
	grid-template-areas:'sideBar topBar topBar'
						'sideBar playBar playBar'
						'sideBar playList properties';
}

.sideBar {
	grid-area: sideBar;
	height: calc(100vh - 50px);
	padding-top: 50px;

	.trackList {
		height: 100%;
		overflow-x: hidden;
		overflow-y: scroll;
		padding: 0px 10px 10px 10px;

		.seperator {
			padding: 0px 0px 0px 6px;
			margin: 15px 0px 5px 0px;

			font-size: 1.3rem;
		}
	}
}

.playList {
	grid-area: playList;
	overflow-x: hidden;
	overflow-y: scroll;

	background-color: rgb(29, 29, 29);
	padding: 5px;
}

.properties {
	grid-area: properties;
	background-color: p.$areaBG4;
}

.trafficLightDrag {
	-webkit-app-region: drag;
	position: fixed;
	width: 300px;
	height: 50px;
	top: 0px;
	left: 0px;
}

</style>
