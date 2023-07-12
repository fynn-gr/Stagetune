<script lang="ts">
    import { emit, listen } from '@tauri-apps/api/event';
    import { platform } from '@tauri-apps/api/os';
	import { convertFileSrc } from '@tauri-apps/api/tauri';
    import { appWindow, LogicalSize } from '@tauri-apps/api/window';

    let videoElement: HTMLVideoElement;
    let src: string;
    let fullscreen = false;

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
        src={src}
        data-tauri-drag-region
        bind:this={videoElement}
        on:canplay={() => videoElement.play()}
        on:timeupdate={() => emit("video_state", {
            "progress": videoElement.currentTime / videoElement.duration,
            "buffer": videoElement.buffered
        })}
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
