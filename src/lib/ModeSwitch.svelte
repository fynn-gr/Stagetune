<script lang="ts">
import { onMount } from "svelte";
import { editMode } from "@/ts/Stores.svelte";

interface Props {
	id: string;
	icon: string;
	iconActive?: string | null;
	active?: boolean;
	onChange?: Function;
	toolTip: string;
	disabled?: boolean;
}

let {
	id,
	icon,
	iconActive = null,
	active = $bindable(),
	onChange = (active: boolean) => {},
	toolTip,
	disabled = false,
}: Props = $props();

let self: HTMLElement;
let iconPath: string = $state("");
let iconPathActive: string = $state("");

onMount(() => {
	iconPath = `./icons/topbar/${icon}.svg`;

	if (iconActive == null) {
		iconPathActive = iconPath;
	} else {
		iconPathActive = `./icons/topbar/${iconActive}.svg`;
	}
});
</script>

<button
	id={`btn-${id}`}
	bind:this={self}
	class="topbar-button mode-switch"
	class:disabled
	onclick={() => {
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
