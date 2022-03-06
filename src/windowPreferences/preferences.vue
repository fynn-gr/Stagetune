<template>
	<topBar/>
	<div class="mainFrame">
	</div>
</template>




<script>

import topBar from "./components/topBar.vue";

export default {
	name: "App",
	components: {
		topBar,
	},
};

</script>




<style lang="scss">

* {
	margin: 0;
	padding: 0;
	font-family: Arial, Helvetica, sans-serif;
}

body {
	background-color: rgb(5, 5, 5);
}

#app {
	box-sizing: border-box;
	width: 100vw;

	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;

	
}

.mainFrame {
	display: grid;
	box-sizing: border-box;
	height: calc(100vh - 30px);
	padding: 3px;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 60px 1fr;
	grid-template-areas:'playBar   playBar'
						'trackList playList';
	gap: 3px;
}

</style>
