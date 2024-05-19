<script lang="ts">
//export let buffer: AudioBuffer;
export let data: Array<number>;
export let samples: number;
export let resY: number;
let resX = window.innerWidth;
let step = resX / samples;

let canvas: HTMLCanvasElement;
let can: CanvasRenderingContext2D;

$: if (data != undefined && canvas != undefined) {
	//let data = waveformCalc(buffer, samples, cutInFac);
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
</script>

<canvas class="waveform" width={resX} height={resY} bind:this={canvas} />
