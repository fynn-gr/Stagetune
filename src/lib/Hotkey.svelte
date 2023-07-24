<script lang="ts">
    import { hotkeys, currentDragging, isEditing, editMode } from "@/stores";
	import { fileNameFromPath } from "@/utils";
	import { convertFileSrc } from "@tauri-apps/api/tauri";
	import { onMount } from "svelte";

    export let ctx: AudioContext;
    export let track: any;
	let missing = false;
	let loaded = false;
	let audioBuffer: AudioBuffer;
	let input: AudioBufferSourceNode;

    async function handleDropHotkeys(e) {
		e.preventDefault();
		if ($currentDragging.path && $currentDragging.type == "track") {
			console.log("drop new track into Hotkeys: ", $currentDragging);

            track.path = $currentDragging.path;
            if(track.playing) input.stop();
            input = null;
            const response = await fetch(convertFileSrc(track.path));
            const arrayBuffer = await response.arrayBuffer();
            audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            input = new AudioBufferSourceNode(ctx, {buffer: audioBuffer});
            input.connect(ctx.destination);
            input.onended = onEnd

			$currentDragging = null;
		} else {
			$currentDragging = null;
		}

        console.log("hotkeys", $hotkeys)
	}

    function onEnd() {
        track.playing = false;
        input = null;
        input = new AudioBufferSourceNode(ctx, {buffer: audioBuffer});
        input.connect(ctx.destination);
        input.onended = onEnd;
    }

    onMount(async () => {
        const response = await fetch(convertFileSrc(track.path));
		const arrayBuffer = await response.arrayBuffer();
		audioBuffer = await ctx.decodeAudioData(arrayBuffer);
		input = new AudioBufferSourceNode(ctx, {buffer: audioBuffer})
		input.connect(ctx.destination);
		
		loaded = true;

		input.onended = onEnd

        document.addEventListener("keydown", e => {
            if ($isEditing > 0) {
				return;
			} else if (e.code === `Digit${track.key}` && !e.ctrlKey && !e.altKey && !track.playing) {
                //playing
                input.start(0);
                track.playing = true;
            } else if (e.code === `Digit${track.key}` && !e.ctrlKey && e.altKey && $editMode) {
                //deleting hotkey
                hotkeys.update(items => {
                    track.path = "";
                    track.playing = false;
                    track.title = "";
                    return items;
                })
                input = null;
            }
        })
    })
</script>

<div
    class="hotkeySlot"
    class:playing={track.playing}
    on:dragover={(e) => {
        e.preventDefault();
        return false;
    }}
    on:drop={handleDropHotkeys}
>
    <p class="key">{track.key}</p>
    <p class="name">{fileNameFromPath(track.path)}</p>

</div>