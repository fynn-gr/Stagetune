<script lang="ts">
import PropNumber from "@/pureUI/components/props/PropNumber.svelte";
import { selectedItem, isEditing, playlist } from "@/ts/Stores.svelte";
import type { PlaylistTrack } from "@/ts/Types";
import { editorWaveformSVG } from "@/ts/Utils";

let trackEL: HTMLElement;
let trackWrapperEL: HTMLElement;
let tempEdit: number = $state(0);
let zoom: number = $state(1);
let zoomPosition: number = $state(0);
let svg: string = $state("");

function handleMouseWheel(e: WheelEvent) {
  e.preventDefault();

  const zoomSpeed = 0.001;
  const panSpeed = 0.0015;
  const minZoom = 0.01;
  const maxZoom = 10;

  // If Shift is held, pan horizontally instead of zooming
  if (e.shiftKey) {
    // Adjust zoom position (horizontal scroll)
    zoomPosition += e.deltaY * panSpeed / zoom;
    zoomPosition = Math.max(0, Math.min(1, zoomPosition));
    console.log("Pan → zoomPosition:", zoomPosition.toFixed(3));
    return;
  }

  // Get mouse X position relative to container
  const rect = trackEL.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) / rect.width; // 0–1 within container

  // Compute new zoom value
  const delta = e.deltaY * zoomSpeed;
  const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom * (1 - delta)));

  // Adjust zoomPosition to zoom toward cursor
  // If zooming in, focus more on cursor position
  const zoomRatio = newZoom / zoom;
  zoomPosition = mouseX - (mouseX - zoomPosition) * zoomRatio;
  zoomPosition = Math.max(0, Math.min(1, zoomPosition));

  zoom = newZoom;

  console.log("Zoom:", zoom.toFixed(3), "ZoomPosition:", zoomPosition.toFixed(3));
}

$effect(() => {
	if (!$selectedItem) return;
	if (!playlist[$selectedItem].edit) return;
	tempEdit = playlist[$selectedItem].edit.in;
});

$effect(() => {
	console.log("editor rerender effect")
	if($selectedItem == undefined) return;
	if(!playlist[$selectedItem].edit) return;
	svg = editorWaveformSVG(
		trackEL.clientWidth,
		trackEL.clientHeight,
		1,
		0,
		playlist[$selectedItem].buffer,
		0,
		0
	);
})
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="editor">
	{#if $selectedItem != undefined && playlist[$selectedItem].type === "track" && (playlist[$selectedItem] as PlaylistTrack).buffer != null}
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

		<div class="track-wrapper">
			<div
				class="track"
				bind:this={trackEL}
				bind:this={trackWrapperEL}
			>
				{#if playlist[$selectedItem]?.buffer}
					{@html svg}
				{:else}
					<svg
						class="waveform"
						width="100%"
						height="48"
						viewBox="0 0 1200 48"
						preserveAspectRatio="none"
						aria-hidden="true"
					>
						<rect
							x="0"
							y="0"
							width="100%"
							height="100%"
							fill="rgba(255,255,255,0.02)"
						/>
					</svg>
				{/if}
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
	{:else}
		<p class="placeholder">No track selected</p>
	{/if}
</div>
