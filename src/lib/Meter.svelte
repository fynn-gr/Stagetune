<script lang="ts">
import { onMount } from "svelte";

interface Props {
	analyser: AnalyserNode;
}
let { analyser }: Props = $props();
let meterCanvas: HTMLCanvasElement;
let meterCtx: CanvasRenderingContext2D;

analyser.fftSize = 256;
const sampleBuffer = new Float32Array(analyser.fftSize);

function drawMeter() {
	requestAnimationFrame(drawMeter);

	analyser.getFloatTimeDomainData(sampleBuffer);
	const sumPeak = sampleBuffer.reduce((sum, value) => sum + value ** 2, 0);
	const avgDecibels = 10 * Math.log10(sumPeak / sampleBuffer.length);
	const displayHeight =
		Math.max(0, Math.min(1, (avgDecibels + 50) / 50)) * meterCanvas.height;

	meterCtx.clearRect(0, 0, meterCanvas.width, meterCanvas.height);
	meterCtx.fillStyle = "rgb(256, 0, 0)";
	meterCtx.fillRect(
		0,
		meterCanvas.height - displayHeight,
		meterCanvas.width,
		displayHeight,
	);
}

onMount(() => {
	meterCtx = meterCanvas.getContext("2d")!;
	drawMeter();
});
</script>

<div class="meter">
	<canvas bind:this={meterCanvas} width="30" height="500"></canvas>
</div>
