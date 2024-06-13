<script lang="ts">
import { onMount } from "svelte";
import { editMode, uiPlatform } from "@/ts/Stores";

export let icon: string;
export let iconActive: string = null;
export let active: boolean;
export let onChange = (active: boolean) => {};
export let activeColor: string = null;
export let toolTip: string;
export let disabled = false;

let self: HTMLElement;
let topBarType;
let topBarShort;
let iconPath;
let iconPathActive;

onMount(() => {
	let cls = self;
	while (cls.parentElement) {
		cls = cls.parentElement;

		if (cls.classList.contains("toolbar")) {
			topBarType = "toolbar-button";
			topBarShort = "tool_bar";
		} else if (cls.classList.contains("buttonbar")) {
			topBarType = "buttonbar-button";
			topBarShort = "button_bar";
		}
	}

	iconPath = `./icons/${topBarShort}/${icon}.svg`;

	if (iconActive == null) {
		iconPathActive = iconPath;
	} else {
		iconPathActive = `./icons/${topBarShort}/${iconActive}.svg`;
	}
});
</script>

<button
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
