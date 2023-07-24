<script lang="ts">
    import { emit, listen } from '@tauri-apps/api/event';
    import { platform } from '@tauri-apps/api/os';
	import { convertFileSrc } from '@tauri-apps/api/tauri';
    import { appWindow, LogicalSize } from '@tauri-apps/api/window';
	import { onMount } from 'svelte';

    let videoElement: HTMLVideoElement;
    let src: string;
    let fullscreen = false;

    let ctx = new AudioContext()
	let input: MediaElementAudioSourceNode;
    let gainNode: GainNode;
    let panNode: StereoPannerNode;

    const unlisten = listen("play_video", (event: any) => {
        const p = platform()
        .then(e => {
            src = convertFileSrc(event.payload.url)
        })
    })
    
    const unlistenPause = listen("update_play", (e: any) => {
        console.log(e.payload)
        if (e.payload.action == "stop") {
            src="";
        } else if (e.payload.action == "skip") {
            console.log(videoElement.duration * e.payload.position)
            videoElement.currentTime = videoElement.duration * e.payload.position;
        } else if (e.payload.action == "pause") {
            videoElement.pause();
        } else if (e.payload.action == "resume") {
            videoElement.play();
        }  
    })

	onMount(async () => {

        input = ctx.createMediaElementSource(videoElement);

        gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(100 / 360, ctx.currentTime)
        panNode = ctx.createStereoPanner();
        input.connect(gainNode).connect(panNode).connect(ctx.destination);

        
        const loop = async () => {
            await setTimeout(() => {
                console.log(videoElement.buffered)
                loop();
            }, 1000)
        }
        loop();
        
    });

</script>

<!-- svelte-ignore a11y-media-has-caption -->
<div
    class="wrapper"
    on:dblclick={() => {
        if (fullscreen) {
            appWindow.setFullscreen(false);
            appWindow.setSize(new LogicalSize(720, 480))
        } else {
            appWindow.setFullscreen(true);
        }
    }}
>
    <video
        id="video"
        controls={true}
        src={src}
        preload="auto"
        data-tauri-drag-region
        bind:this={videoElement}
        on:canplaythrough={() => {videoElement.play()}}
        on:canplay={() => {}}
    />
</div>

<style lang="scss">
    .wrapper {
        display: flex;
        justify-content: center;
        overflow: hidden;
        width: 100vw;
        height: 100vh;
        margin: 0;
        padding: 0;
        background-color: black;

        video {
            width: 100%;
            height: 100%;
            object-fit: contain;
            margin: auto;
        }
    }
</style>
