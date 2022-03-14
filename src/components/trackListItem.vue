<template>
  <div class="playListItem">
    <p>Messias: Einlass Musik Loop</p>
  </div>
</template>




<script>
export default {
  name: "trackListItem",
  props: {},
};
</script>




<style scoped lang="scss">

.playListItem{
    -webkit-user-select: none;
    box-sizing: border-box;
    height: 30px;
    padding: 6px;

    border-radius: 5px;
    background-color: transparent;

    &:hover {
        background-color: #555;
    }
}

p {
    font-size: 1.5rem;
}

</style>
