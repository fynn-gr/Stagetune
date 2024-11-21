<script lang="ts">
import { onMount } from "svelte";
import { editMode, uiPlatform } from "@/ts/Stores";

export let id: string;
export let icon: string;
export let iconActive: string = null;
export let active: boolean;
export let onChange = (active: boolean) => {};
export let activeColor: string = null;
export let toolTip: string;
export let disabled = false;

let self: HTMLElement;
let iconPath: string;
let iconPathActive: string;

onMount(() => {

	iconPath = `./icons/top_bar/${icon}.svg`;

	if (iconActive == null) {
		iconPathActive = iconPath;
	} else {
		iconPathActive = `./icons/top_bar/${iconActive}.svg`;
	}
});
</script>

<button
	id={`btn-${id}`}
	bind:this={self}
	class="topbar-button mode-switch"
	class:disabled
	on:click={() => {
		!disabled ? (active = !active) : (active = active);
		onChange(active);
	}}
	{disabled}
	title={toolTip}
	style={`background-color: ${active ? "none" : "var(--accent)"};`}
>
	<img src={active ? iconPathActive : iconPath} alt={toolTip} />

	<div>
		<p style={`visibility: ${$editMode ? "visible" : "hidden"}`}>Edit</p>
		<p style={`visibility: ${$editMode ? "hidden" : "visible"}`}>Live</p>
	</div>
</button>
