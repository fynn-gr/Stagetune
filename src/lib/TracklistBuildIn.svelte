<script lang="ts">
import { currentDragging, draggingOrigin } from "@/ts/Stores.svelte";
import { _ } from "svelte-i18n";

interface Props {
	name: "annotation" | "loop" ;
}
let { name }: Props = $props();

let dragging = $state(false);

function handleDragStart(e: any) {
	e.dataTransfer.dropEffect = "copy";
	e.dataTransfer.setData("text/plain", "placehold");
	$currentDragging = {
		type: name,
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
	{#if name == "annotation"}
		<img src="./icons/topbar/comment.svg" alt="" />
	{:else if name == "loop"}
		<img src="./icons/topbar/loop.svg" alt="" />
	{/if}
	<p>{$_(name)}</p>
</div>
