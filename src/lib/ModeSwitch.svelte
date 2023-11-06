<script lang="ts">
	import { onMount } from "svelte";
	import { editMode, uiPlatform } from "@/stores";

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
				topBarShort = "tb";
			} else if (cls.classList.contains("buttonbar")) {
				topBarType = "buttonbar-button";
				topBarShort = "bb";
			}
		}

		iconPath = `./icons/${topBarShort}_${$uiPlatform}/${icon}.svg`;

		if (iconActive == null) {
			iconPathActive = iconPath;
		} else {
			iconPathActive = `./icons/${topBarShort}_${$uiPlatform}/${iconActive}.svg`;
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
	style={`background-color: ${active ? activeColor : "none"};`}
>
	<img src={active ? iconPathActive : iconPath} alt={toolTip} />

	<p>{$editMode ? "Edit" : "Live"}</p>
</button>
