<script lang="ts">

  export let path: string;

  function getName() {
    let split = path.split('/');
    let fileName = split[split.length -1]
    let name = fileName.substring(0, fileName.lastIndexOf('.'))
    return name;
  }

</script>

<div class="trackListItem">
  <p>{getName()}</p>
</div>
