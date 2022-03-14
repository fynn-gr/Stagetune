<template>
	<div class="playBar">

	</div>
</template>




<script>
export default {
	name: 'playBar',
	props: {
	}
}
</script>




<style scoped lang="scss">

@use '../../../pureUI/scss/index.scss' as p;

.playBar {
	grid-area: playBar;

	background-color: p.$areaBG5;
}

</style>
