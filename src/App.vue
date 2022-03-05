<template>
  <playlist-item/>
</template>

<script>
import playlistItem from './components/playlistItem.vue'

export default {
  name: 'App',
  components: {
    playlistItem,
  }
}
</script>

<style lang="scss">
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: 60px;
}
</style>
