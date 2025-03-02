<script lang="ts">
import { currentDragging, draggingOrigin } from "@/ts/Stores.svelte";

interface Props {
	name: string;
}
let { name }: Props = $props();

let dragging = $state(false);

function handleDragStart(e: any) {
	e.dataTransfer.dropEffect = "copy";
	e.dataTransfer.setData("text/plain", "placehold");
	$currentDragging = {
		type: name == "Annotation" ? "annotation" : "loop",
		name: name,
		path: "",
		pathSource: "",
	};
	$draggingOrigin = "src";
	dragging = true;
	//console.log("drag start", $currentDragging);
}

function handleDragEnd(e: any) {
	dragging = false;
	//console.log("end dragging", e);
}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_missing_attribute -->
<div
	class="trackListItem"
	class:dragging
	draggable="true"
	ondragstart={handleDragStart}
	ondragend={handleDragEnd}
>
	{#if name == "Annotation"}
		<img src="./icons/topbar/comment.svg" alt="" />
	{:else if name == "Loop"}
		<img src="./icons/topbar/loop.svg" alt="" />
	{/if}
	<p>{name}</p>
</div>
