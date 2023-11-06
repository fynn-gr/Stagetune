<script lang="ts">
	import { currentDragging, playlist } from "@/stores";

	export let id: number;

	$: if ($currentDragging == null) {
		$playlist.splice(id, 1);
	}
</script>

<div class="playlist-item insert">
	<div class="border">
		<div class="indicator" />
	</div>
</div>
