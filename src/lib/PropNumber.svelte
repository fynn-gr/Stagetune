<script lang="ts">
interface Props {
	value: number;
	min: number;
	max: number;
	softMin?: number;
	softMax?: number;
	decimalDisplay?: number;
	step?: number;
	unit?: string;
	disabled?: boolean;
	onFocus?: Function;
	onBlur?: Function;
	onChange?: Function;
	title: string;
}
let {
	value = $bindable(),
	min,
	max,
	softMin = min,
	softMax = max,
	decimalDisplay = 2,
	step = 1,
	unit = "",
	disabled = false,
	onFocus = () => {},
	onBlur = () => {},
	onChange = () => {},
	title,
}: Props = $props();

let dispValue: number = $state(0);

function handleChange() {
	onChange(value);
}

$effect(() => {
	if (decimalDisplay == 0) {
		dispValue = Math.round(value);
	} else {
		const factor = Math.pow(10, decimalDisplay);
		dispValue = Math.round(value * factor) / factor;
	}
});
</script>

<div class="prop-number">
	<p class="display">{dispValue} {unit}</p>
	<input
		type="number"
		{disabled}
		onchange={handleChange}
		bind:value
		{step}
		{max}
		{min}
		onfocus={() => {
			onFocus();
		}}
		onblur={() => {
			onBlur();
		}}
	/>
</div>
