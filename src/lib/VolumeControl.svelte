<script lang="ts">
import "../style/VolumeOptions.scss";
import { editMode } from "@/ts/Stores";
import type { PlaylistItem } from "@/ts/Types";

export let track: PlaylistItem;
export let slider: boolean = true;

function handleVolumeDrag(e: any) {
	e.preventDefault();
	e.stopPropagation();
	track.volume -= Math.round(e.movementY * 0.4);
	track.volume = Math.max(0, Math.min(track.volume, 100));
}

function handlePanDrag(e: any) {
	e.preventDefault();
	e.stopPropagation();
	track.pan -= e.movementY * 0.01;
	track.pan = Math.max(-1, Math.min(track.pan, 1));
}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if slider}
	<div class="volume slider">
		<span>
			<p>Vol</p>
			<input
				bind:value={track.volume}
				type="range"
				min="0"
				max="100"
				step="10"
				disabled={!$editMode}
			/>
		</span>

		<span>
			<p>Pan</p>
			<input
				class="pan"
				bind:value={track.pan}
				type="range"
				min={-1}
				max={1}
				step={0.25}
				disabled={!$editMode}
			/>
		</span>
	</div>
{:else}
	<div class="volume knobs">
		<!--Volume-->
		<span
			on:mousedown={e => {
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
            var(--accent) ${track.volume * 2.7}deg,
            rgb(77, 77, 77) ${track.volume * 2.7}deg,
            rgb(77, 77, 77) 270deg,
            transparent 270deg,
            transparent 360deg
          );
        `}
			/>
			<div class="knob" style={`rotate: ${track.volume * 2.7 - 135}deg;`}>
				<div class="mark" />
			</div>
		</span>

		<!--Pan-->
		<span
			on:mousedown={e => {
				console.log("start drag");
				document.addEventListener("mousemove", handlePanDrag);
				document.addEventListener("mouseup", f => {
					document.removeEventListener("mousemove", handlePanDrag);
				});
			}}
		>
			<div
				class="arch"
				style={track.pan == 0
					? "background: rgb(77, 77, 77);"
					: track.pan < 0
						? `background-image: conic-gradient(
            rgb(77 ,77, 77) 0deg,
            rgb(77, 77, 77) 135deg,
            transparent 135deg,
            transparent 225deg,
            rgb(77, 77, 77) 225deg,
            rgb(77, 77, 77) ${360 - track.pan * -135}deg,
            var(--accent) ${360 - track.pan * -135}deg,
            var(--accent) 360deg
          );`
						: `background-image: conic-gradient(
            var(--accent) 0deg,
            var(--accent) ${track.pan * 135}deg,
            rgb(77, 77, 77) ${track.pan * 135}deg,
            rgb(77, 77, 77) 135deg,
            transparent 135deg,
            transparent 225deg,
            rgb(77, 77, 77) 225deg,
            rgb(77, 77, 77) 360deg
          );`}
			/>
			<div class="knob" style={`rotate: ${track.pan * 135}deg;`}>
				<div class="mark" />
			</div>
		</span>
	</div>
{/if}
