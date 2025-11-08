<script lang="ts">
import { editMode, isEditing } from "@/ts/Stores.svelte";
import { tick } from "svelte";

interface Props {
	value: number;
	min: number;
	max: number;
	step?: number;
	unit?: string;
	disabled?: boolean;
	onChange?: Function;
}
let {
	value = $bindable(),
	min,
	max,
	step = 1,
	unit = "",
	disabled = false,
	onChange = () => {},
}: Props = $props();

let dispValue: number = $state(0);
let numberIsEditing: boolean = $state(false);
let inputEl: HTMLInputElement;

function handleChange() {
	onChange(value);
}

function handleMouseDown(e: MouseEvent) {
	if (!e.shiftKey) return;
	document.body.addEventListener("mousemove", handleMouseMove);
	document.body.addEventListener("mouseup", (e: MouseEvent) => {
		document.body.removeEventListener("mousemove", handleMouseMove);
		e.preventDefault();
		e.stopPropagation();
	});
	e.preventDefault();
	e.stopPropagation();
}

function handleMouseMove(e: MouseEvent) {
	if (!e.shiftKey) return;
	e.stopPropagation();
	e.preventDefault();
	value = Math.min(Math.max(value + e.movementX * 0.04, 0), 9);
}

function display(inp: number): string {
	if (inp.toString().includes(".")) return inp.toString();
	else return inp.toString() + ".0";
}

$effect(() => {
	const factor = Math.pow(10, 1);
	dispValue = Math.round(value * factor) / factor;
});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="input-number" onmousedown={handleMouseDown}>
	{#if !numberIsEditing}
		<p
			class="display"
			ondblclick={() => {
				if (!$editMode) return;
				numberIsEditing = true;
				isEditing.update(e => e + 1);
				tick().then(() => {
					inputEl.focus();
				});
			}}
		>
			{display(dispValue)}
			{unit}
		</p>
	{:else}
		<input
			type="number"
			{disabled}
			bind:value
			bind:this={inputEl}
			{step}
			{max}
			{min}
			onfocus={e => {
				const target = e.target as HTMLInputElement;
				target.select();
				target.scrollLeft = 0;
			}}
			onchange={handleChange}
			onblur={() => {
				numberIsEditing = false;
				isEditing.update(e => e - 1);
			}}
			onkeydown={e => {
				if (e.key === "Enter") {
					numberIsEditing = false;
				}
			}}
		/>
	{/if}
</div>
