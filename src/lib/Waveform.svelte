<script lang="ts">
interface Props {
	buffer: AudioBuffer | null;
	cutInFac: number;
	samples: number;
	resY: number;
}
let { buffer, cutInFac, samples, resY }: Props = $props();

let resX = window.innerWidth;
let step = resX / samples;
let canvas: HTMLCanvasElement;
let can: CanvasRenderingContext2D;

function waveformCalc(): number[] {
	if (buffer) {
		let rawData = buffer.getChannelData(0);
		let cutData = rawData.subarray(Math.floor(rawData.length * cutInFac));
		const blockSize = Math.floor(cutData.length / samples);
		const filteredData = [];
		for (let i = 0; i < samples; i++) {
			let blockStart = blockSize * i;
			let sum = 0;
			for (let j = 0; j < blockSize; j++) {
				sum = sum + Math.abs(cutData[blockStart + j]);
			}
			filteredData.push(sum / blockSize);
		}

		const multiplier = Math.pow(Math.max(...filteredData), -1);
		return filteredData.map(n => n * multiplier);
	} else {
		return [0];
	}
}

$effect(() => {
	if (buffer != undefined && canvas != undefined) {
		let data = waveformCalc();
		can = canvas.getContext("2d");
		can.fillStyle = "rgb(45, 45, 45)";

		//draw plygon
		can.clearRect(0, 0, canvas.width, canvas.height);
		can.globalAlpha = 1;
		can.beginPath();
		can.moveTo(resX + 1, resY);
		can.lineTo(resX + 1, -1);
		can.lineTo(-1, -1);
		for (let i = 0; i < data.length; i++) {
			let x = i * step;
			let y = resY - data[i] * resY;
			//console.log("x: ", x, "y: ", y)
			can.lineTo(x, y);
		}
		can.fill();
	}
});
</script>

<canvas class="waveform" width={resX} height={resY} bind:this={canvas}></canvas>
