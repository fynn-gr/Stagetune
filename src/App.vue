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
		</div>
	</div>
</template>




<script>
import playlistItem  from "./components/playlistItem.vue";
import trackListItem from "./components/trackListItem.vue";
import playBar 		 from "./components/playBar.vue";
import topBar 		 from "./components/topBar.vue";


export default {
	name: "App",
	components: {
		playlistItem,
		trackListItem,
		topBar,
		playBar
	},
};
</script>




<style lang="scss">

@use '../pureUI/scss/index.scss' as p;

* {
	font-family: Arial, Helvetica, sans-serif;
}

#app {
	font-size: 10px;
	box-sizing: border-box;

	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.windowBody {
	grid-template-columns: 300px 1fr;
	grid-template-rows: 50px 70px 1fr;
	grid-template-areas:'sideBar topBar'
						'sideBar playBar'
						'sideBar playList';
}

.sideBar {
	grid-area: sideBar;
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
	padding: 5px;
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
