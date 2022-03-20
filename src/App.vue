<template>
	<div class="windowBody">
		<div class="trafficLight"></div>
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
			<playlistAnotation />
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
		<div class="statusBar">
			<p>ready</p>
			<div style="width: 30px;"></div>
			<p>Messias Playlist</p>
			<div style="flex: 1;"></div>
			<p>Messias – Einlass Musik</p>
			<div style="flex: 1;"></div>
			<p>Susi 0.3.1 </p>
		</div>
	</div>
</template>




<script>
import playlistItem      from "./components/playlistItem.vue";
import playlistAnotation from "./components/playlistAnotation";
import trackListItem     from "./components/trackListItem.vue";
import playBar 		     from "./components/playBar.vue";
import topBar 		     from "./components/topBar.vue";


export default {
	name: "App",
	components: {
		playlistItem,
		playlistAnotation,
		trackListItem,
		topBar,
		playBar
	},
};
</script>




<style lang="scss">

@use '../pureUI/scss/index.scss' as p;
@use './style.scss' as s;
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
	grid-template-rows: 50px 70px 1fr 25px;
	grid-template-areas:'trafficLight topBar    topBar'
						'sideBar      playBar   playBar'
						'sideBar      playList  properties'
						'statusBar    statusBar statusBar';
}

.sideBar {
	grid-area: sideBar;
	height: calc(100vh - 75px);
	padding-top: 0px;

	.trackList {
		height: 100%;
		overflow-x: hidden;
		overflow-y: scroll;
		padding: 0px 10px 0px 10px;

		.seperator {
			padding: 0px 0px 0px 6px;
			margin: 20px 0px 5px 0px;

			font-size: 1.6rem;
			font-weight: bold;
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

.statusBar {
	grid-area: statusBar;
	display: flex;
	flex-direction: row;
	padding: 2px 10px 0px 10px;
	background-color: s.$accent;

	p {
		font-size: 1.4rem;
		font-weight: bold;
	}

	.spacer {
		flex: 1;
	}
}

.trafficLight {
	-webkit-app-region: drag;
	grid-area: trafficLight;
	width: 400px;
	height: 53px;

	background-color: p.$sideBar;
}

</style>
