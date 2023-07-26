<script lang="ts">
	import { waveformCalc } from "@/utils";
	import { onMount } from "svelte";

	export let buffer: AudioBuffer;
	export let samples: number;
	export let res: Array<number>;
	let resX = res[0];
	let resY = res[1];

	let canvas: HTMLCanvasElement;
	let can: CanvasRenderingContext2D;
	
	$: if (buffer != undefined && canvas != undefined) {
		console.time()
		let data = waveformCalc(buffer, samples);
		can = canvas.getContext("2d");
		can.fillStyle = "rgb(45, 45, 45)";

		//draw plygon
		can.beginPath();
		can.moveTo(resX, 0);
		can.lineTo(0, 0);
		for (let i = 0; i < data.length; i++) {
			let x = i * (resX / samples);
			let y = resY - data[i] * resY;
			can.lineTo(x, y);
		}
		can.fill();
		console.timeEnd()
	}

	onMount(() => {
		
	})

</script>

<canvas class="waveform" width={resX} height={resY} bind:this={canvas}></canvas>