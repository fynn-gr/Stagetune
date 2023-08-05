<script lang="ts">
	export let splashScreen;
	let recent = [];
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="splash"
	on:click={(e) => {
		splashScreen = false;
	}}
>
	<div class="wrapper">
		<img src="./splash.jpg" />
		<div class="top">
			<img src="./app-icon.png" class="icon" />
			<h1>pure<b>Stage</b></h1>
			<p class="version">0.1 Beta</p>
		</div>

		<div class="container">
			<span>
				<button class="online">Website</button>
				<button class="online">Source</button>
				<button class="online">Bug Tracker</button>
				<button class="online">License</button>
			</span>
			<span>
				{#each recent as e}
					<button class="recent">{e}</button>
				{/each}
			</span>
		</div>
	</div>
</div>
