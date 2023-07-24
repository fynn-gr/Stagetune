<script lang="ts">
    import { hotkeys, currentDragging, isEditing, editMode } from "@/stores";
	import type { A } from "@tauri-apps/api/os-1507a225";
	import { convertFileSrc } from "@tauri-apps/api/tauri";
	import { onMount } from "svelte";

    export let track: any;


    function handleDropHotkeys(e) {
		e.preventDefault();
		if ($currentDragging.path && $currentDragging.type == "track") {
			console.log("drop new track into Hotkeys: ", $currentDragging);
			track.path = $currentDragging.path;

			$currentDragging = null;
		} else {
			$currentDragging = null;
		}

        console.log("hotkeys", $hotkeys)
	}


    onMount(async () => {
    })
</script>

<div
    class="hotkeySlot"
    on:dragover={(e) => {
        e.preventDefault();
        return false;
    }}
    on:drop={handleDropHotkeys}
>
    <p class="key">{track.key}</p>
    <p class="placeholder"></p>
</div>