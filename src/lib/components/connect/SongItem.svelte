<script lang="ts">
	import type { Song } from '$lib/types/music';

	let { song }: { song: Song } = $props();

	const releaseYear = $derived.by(() => {
		if (!song.releasedAt) {
			return null;
		}

		const year = new Date(song.releasedAt).getFullYear();

		return Number.isNaN(year) ? null : year;
	});
</script>

<li class="song">
	{#if song.thumbnailUrl}
		<img src={song.thumbnailUrl} alt="" loading="lazy" />
	{:else}
		<span class="thumbnail" aria-hidden="true">♪</span>
	{/if}

	<div class="details">
		<h3>{song.title}</h3>
		<p>{song.artist}</p>
		<p class="meta">
			{#if song.album}
				<span>{song.album}</span>
			{:else}
				<span>Album unavailable from YouTube</span>
			{/if}
			{#if releaseYear !== null}
				<span>{releaseYear}</span>
			{/if}
		</p>
	</div>
</li>

<style>
	.song {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 1rem;
		align-items: center;
		border: 1px solid rgba(31, 24, 48, 0.08);
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.68);
		padding: 0.85rem;
	}

	img,
	.thumbnail {
		width: 4rem;
		height: 4rem;
		border-radius: 0.85rem;
	}

	img {
		object-fit: cover;
	}

	.thumbnail {
		display: grid;
		place-items: center;
		background: rgba(141, 60, 102, 0.12);
		color: #8d3c66;
		font-size: 1.5rem;
	}

	.details {
		min-width: 0;
	}

	h3,
	p {
		margin: 0;
	}

	h3 {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 1rem;
	}

	p {
		margin-top: 0.2rem;
		color: #4d425f;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 0.75rem;
		font-size: 0.9rem;
	}
</style>
