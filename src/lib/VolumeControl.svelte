<script lang="ts">
import "../style/VolumeOptions.scss";
import { editMode } from "@/ts/Stores.svelte";

interface Props {
	volume: number;
	pan: number;
	slider: boolean;
}
let {
	volume = $bindable(),
	pan = $bindable(),
	slider = true,
}: Props = $props();

function handleVolumeDrag(e: any) {
	e.preventDefault();
	e.stopPropagation();
	volume -= Math.round(e.movementY * 0.4);
	volume = Math.max(0, Math.min(volume, 100));
}

function handlePanDrag(e: any) {
	e.preventDefault();
	e.stopPropagation();
	pan -= e.movementY * 0.01;
	pan = Math.max(-1, Math.min(pan, 1));
}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if slider}
	<div class="volume slider">
		<span>
			<p>Vol</p>
			<input
				bind:value={volume}
				type="range"
				min="0"
				max="100"
				step="10"
				disabled={!$editMode}
				title="Volume"
			/>
		</span>

		<span>
			<p>Pan</p>
			<input
				class="pan"
				bind:value={pan}
				type="range"
				min={-1}
				max={1}
				step={0.25}
				disabled={!$editMode}
				title="Pan"
			/>
		</span>
	</div>
{:else}
	<div class="volume knobs">
		<!--Volume-->
		<span
			onmousedown={e => {
				console.log("start drag");
				document.addEventListener("mousemove", handleVolumeDrag);
				document.addEventListener("mouseup", f => {
					document.removeEventListener("mousemove", handleVolumeDrag);
				});
			}}
		>
			<div
				class="arch"
				style={`
          background-image: conic-gradient(
            from 225deg,
            var(--accent) 0deg,
            var(--accent) ${volume * 2.7}deg,
            rgb(77, 77, 77) ${volume * 2.7}deg,
            rgb(77, 77, 77) 270deg,
            transparent 270deg,
            transparent 360deg
          );
        `}
			></div>
			<div class="knob" style={`rotate: ${volume * 2.7 - 135}deg;`} title="Volume">
				<div class="mark"></div>
			</div>
		</span>

		<!--Pan-->
		<span
			onmousedown={e => {
				console.log("start drag");
				document.addEventListener("mousemove", handlePanDrag);
				document.addEventListener("mouseup", f => {
					document.removeEventListener("mousemove", handlePanDrag);
				});
			}}
		>
			<div
				class="arch"
				style={pan == 0
					? "background: rgb(77, 77, 77);"
					: pan < 0
						? `background-image: conic-gradient(
            rgb(77 ,77, 77) 0deg,
            rgb(77, 77, 77) 135deg,
            transparent 135deg,
            transparent 225deg,
            rgb(77, 77, 77) 225deg,
            rgb(77, 77, 77) ${360 - pan * -135}deg,
            var(--accent) ${360 - pan * -135}deg,
            var(--accent) 360deg
          );`
						: `background-image: conic-gradient(
            var(--accent) 0deg,
            var(--accent) ${pan * 135}deg,
            rgb(77, 77, 77) ${pan * 135}deg,
            rgb(77, 77, 77) 135deg,
            transparent 135deg,
            transparent 225deg,
            rgb(77, 77, 77) 225deg,
            rgb(77, 77, 77) 360deg
          );`}
			></div>
			<div class="knob" style={`rotate: ${pan * 135}deg;`} title="Pan">
				<div class="mark"></div>
			</div>
		</span>
	</div>
{/if}
