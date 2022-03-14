<template>
	<div class="topBar">
		<div class="toolBar">
			<button class="toolBarItem"> S </button>
			<div class="spacer"></div>
			<button class="toolBarItem"> b </button>
			<button class="toolBarItem"> P </button>
			<button class="toolBarItem"> p </button>
			<button class="toolBarItem"> f </button>
			<div class="spacer"></div>
			<button class="toolBarItem"> P </button>
		</div>
	</div>
</template>




<script>
export default {
	name: 'topBar',
	props: {
	}
}
</script>




<style scoped lang="scss">

@use '../../../pureUI/scss/index.scss' as p;

.topBar {
	-webkit-app-region: drag;
	-webkit-user-select: none;

	.toolBarItem {
		color: #ddd;
	}

	.spacer {
		flex: 1;
	}
}

</style>
