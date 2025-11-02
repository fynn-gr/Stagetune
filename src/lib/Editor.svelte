<script lang="ts">
import PropNumber from "@/pureUI/components/props/PropNumber.svelte";
import {
	selectedItem,
	isEditing,
	playlist,
	playlistElements,
} from "@/ts/Stores.svelte";
import Waveform from "./Waveform.svelte";

interface Props {}

let tempEdit: number = $state(0);
tempEdit = playlist[$selectedItem].edit.in;

$effect(() => {
	tempEdit = playlist[$selectedItem].edit.in;
})
</script>

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
				onChange={() => {playlist[$selectedItem].edit.in = tempEdit}}
				title="cut in"
			/>
		</div>

		<div class="track-wrapper">
			<div
				class="track"
				style={`
							background: linear-gradient(
								90deg,
								#111 0%,
								#111 calc(100% * ${
									tempEdit /
									playlist[$selectedItem].length
								}),
								#fff calc(100% * ${
									tempEdit /
									playlist[$selectedItem].length
								}),
								#fff 100%
							);`}
			>
				<Waveform
					buffer={playlistElements[$selectedItem].getBuffer()}
					cutInFac={0}
					samples={window.innerWidth}
					resY={200}
				/>
				<input
					type="range"
					min="0"
					max={playlist[$selectedItem].length}
					step="0.01"
					bind:value={tempEdit}
					onmouseup={() => {playlist[$selectedItem].edit.in = tempEdit}}
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
