<script lang="ts">
  import { currentDragging } from "../stores";


  export let path: string;
  export let fileName: string

  let self: HTMLElement;
  let dragging = false;

  function getName() {
    let name = fileName.substring(0, fileName.lastIndexOf('.'))
    return name;
  }

  function handleDragStart(e) {
    e.dataTransfer.dropEffect = "copy";
    e.dataTransfer.setData("text/plain", "placehold");
    $currentDragging = path;
    dragging = true;
    console.log("drag start", e);

  }

  function handleDragEnd(e) {
    dragging = false;
    console.log("end dragging", e)
  }

</script>

<div
  bind:this={self}
  class="trackListItem"
  class:dragging={dragging}
  draggable="true"
  on:dragstart={handleDragStart}
  on:dragend={handleDragEnd}
>
  <p>{getName()}</p>
</div>
