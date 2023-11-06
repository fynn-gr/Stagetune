<script lang="ts">
	import { onMount } from "svelte";
	import { mapRange } from "../utils";

	export let analyser: any;
	export let ctx: AudioContext;
	let meterCanvas: HTMLCanvasElement;
	let meterCtx: CanvasRenderingContext2D;
	let lastDB = -100;

	analyser.fftSize = 256;
	const bufferLength = analyser.frequencyBinCount;
	const sampleBuffer = new Float32Array(bufferLength);

	function drawMeter() {
		requestAnimationFrame(drawMeter);

		analyser.getFloatTimeDomainData(sampleBuffer);
		meterCtx.fillStyle = "rgb(40, 40, 40)";
		meterCtx.fillRect(0, 0, meterCanvas.width, meterCanvas.height);

		let sumPeak = 0;
		for (let i = 0; i < sampleBuffer.length; i++) {
			sumPeak += sampleBuffer[i] ** 2;
		}
		const avgDecibels = 10 * Math.log10(sumPeak / sampleBuffer.length);
		const smoothDecibels = avgDecibels > lastDB ? avgDecibels : lastDB - 0.2;
		const displayY = mapRange(smoothDecibels, -50, 0, 0, meterCanvas.height);
		lastDB = smoothDecibels;

		meterCtx.fillStyle = "rgb(256, 0, 0)";
		meterCtx.fillRect(
			0,
			meterCanvas.height - displayY,
			meterCanvas.width,
			meterCanvas.height
		);
	}

	onMount(() => {
		meterCtx = meterCanvas.getContext("2d");
		drawMeter();
	});
</script>

<div class="meter">
	<canvas class="can-meter" bind:this={meterCanvas} width="30" height="500" />
</div>
