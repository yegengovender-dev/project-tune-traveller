<script lang="ts">
	import SongItem from './SongItem.svelte';
	import type { Song } from '$lib/types/music';

	let { songs }: { songs: Song[] } = $props();
</script>

<section class="list" aria-labelledby="songs-title">
	<div class="header">
		<p class="eyebrow">Imported favourites playlist</p>
		<h2 id="songs-title">{songs.length} favourite songs</h2>
	</div>

	<ul>
		{#each songs as song (song.id)}
			<SongItem {song} />
		{/each}
	</ul>
</section>

<style>
	.list {
		display: grid;
		gap: 1rem;
	}

	.header {
		display: grid;
		gap: 0.35rem;
	}

	.eyebrow,
	h2 {
		margin: 0;
	}

	.eyebrow {
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #8d3c66;
	}

	h2 {
		font-size: clamp(1.5rem, 4vw, 2.25rem);
		letter-spacing: -0.04em;
	}

	ul {
		display: grid;
		gap: 0.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
</style>
