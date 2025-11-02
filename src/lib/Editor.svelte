<script lang="ts">
import PropNumber from "@/pureUI/components/props/PropNumber.svelte";
import { selectedItem, isEditing, playlist } from "@/ts/Stores.svelte";
import { mapRange } from "@/ts/Utils";

let trackEL: HTMLElement;
let trackWrapperEL: HTMLElement;
let zoom: number = $state(1);
let tempEdit: number = $state(0);
tempEdit = playlist[$selectedItem].edit.in;

function handleMouseWheel(e: WheelEvent) {
	e.preventDefault();
	const factor = 1.15; // zoom step
	if (e.deltaY < 0) {
		// zoom in (smaller value -> closer)
		zoom = Math.max(0.01, zoom / factor);
	} else if (e.deltaY > 0) {
		// zoom out (larger value -> farther)
		zoom = Math.min(1, zoom * factor);
	}
	console.log(zoom)
}

$effect(() => {
	tempEdit = playlist[$selectedItem].edit.in;
});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="editor">
	{#if $selectedItem !== undefined && playlist[$selectedItem].type === "track" && (playlist[$selectedItem] as PlaylistTrack).buffer != null}
		<div class="prop-bar">
			<label>cut start</label>
			<PropNumber
				bind:value={tempEdit}
				min={0}
				max={playlist[$selectedItem].length}
				step={1}
				unit="s"
				onFocus={() => {
					isEditing.update(e => e + 1);
					console.log($isEditing);
				}}
				onBlur={() => {
					isEditing.update(e => e - 1);
					console.log($isEditing);
				}}
				onChange={() => {
					playlist[$selectedItem].edit.in = tempEdit;
				}}
				title="cut in"
			/>
		</div>

		<div
			class="track-wrapper"
			onmouseenter={() => {trackWrapperEL.addEventListener("wheel", handleMouseWheel)}}
			onmouseleave={() => {trackWrapperEL.removeEventListener("wheel", handleMouseWheel)}}
			bind:this={trackWrapperEL}
		>
			<div class="track" bind:this={trackEL}>
				<svg
					class="waveform"
					width="100%"
					height="48"
					viewBox="0 0 1200 48"
					preserveAspectRatio="none"
					aria-hidden="true"
				>
					{#if playlist[$selectedItem]?.buffer}
						<path
							d={(() => {
								const buf = playlist[$selectedItem].buffer;
								const samples = buf.getChannelData
									? buf.getChannelData(0)
									: buf;
								if (!samples || samples.length === 0) return "";
								const W = 1200; // Increased from 600 to 1200 for more detail
								const H = 48;
								const mid = H / 2;
								const step = Math.max(1, Math.floor(samples.length / W) / 2); // Reduced step size
								let dTop = "";
								let dBottom = "";
								for (let x = 0, i = 0; x < W; x++, i += step) {
									let min = 1,
										max = -1;
									const start = Math.floor(i);
									const end = Math.min(samples.length, Math.floor(i + step));
									for (let j = start; j < end; j++) {
										const v = samples[j];
										if (v < min) min = v;
										if (v > max) max = v;
									}
									const yMax = mid - max * mid;
									const yMin = mid - min * mid;
									dTop +=
										x === 0 ? "M" + x + " " + yMax : " L" + x + " " + yMax;
									dBottom = " L" + x + " " + yMin + dBottom;
								}
								return dTop + dBottom + " Z";
							})()}
							fill="rgba(255,255,255,0.08)"
							stroke="rgba(255,255,255,0.15)"
							stroke-width="0.4"
						/>
					{:else}
						<rect
							x="0"
							y="0"
							width="100%"
							height="100%"
							fill="rgba(255,255,255,0.02)"
						/>
					{/if}
				</svg>
				<input
					type="range"
					min="0"
					max={playlist[$selectedItem].length}
					step="0.01"
					bind:value={tempEdit}
					onmouseup={() => {
						playlist[$selectedItem].edit.in = tempEdit;
					}}
				/>
			</div>
			<div
				class="border"
				style={`left: ${(tempEdit / playlist[$selectedItem].length) * 100}%;`}
			></div>
		</div>
	{/if}
	<p class="placeholder">No track selected</p>
</div>
