<script lang="ts">
	import AccountBadge from './AccountBadge.svelte';
	import SongList from './SongList.svelte';
	import type { ConnectedAccount, Playlist } from '$lib/types/music';

	let { account, playlist }: { account: ConnectedAccount; playlist: Playlist } = $props();
</script>

<section class="stack" aria-labelledby="connected-title">
	<div class="hero">
		<p class="eyebrow">Connected</p>
		<h1 id="connected-title">Your favourites are ready.</h1>
		<p>
			Review the imported YouTube Music favourites playlist below. YouTube does not always provide
			structured album metadata, so some albums may be marked unavailable.
		</p>
	</div>

	<AccountBadge {account} />

	<div class="playlist-summary">
		<div>
			<p class="label">Playlist</p>
			<h2>{playlist.title}</h2>
		</div>
		<p class="count">{playlist.totalItems} songs imported</p>
	</div>

	<SongList songs={playlist.songs} />

	<button type="button" disabled>Continue to cross-reference</button>
</section>

<style>
	.stack {
		display: grid;
		gap: 1.25rem;
	}

	.hero,
	.playlist-summary {
		border: 1px solid rgba(31, 24, 48, 0.1);
		border-radius: 2rem;
		background: rgba(255, 255, 255, 0.72);
		padding: clamp(1.25rem, 4vw, 2rem);
		box-shadow: 0 1.5rem 4rem rgba(79, 55, 112, 0.12);
	}

	.eyebrow,
	.label,
	h1,
	h2,
	p {
		margin: 0;
	}

	.eyebrow,
	.label {
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #8d3c66;
	}

	h1 {
		max-width: 13ch;
		margin-top: 0.5rem;
		font-size: clamp(2.5rem, 8vw, 4.5rem);
		line-height: 0.95;
		letter-spacing: -0.07em;
	}

	.hero p:not(.eyebrow) {
		max-width: 44rem;
		margin-top: 1rem;
		color: #4d425f;
		line-height: 1.65;
	}

	.playlist-summary {
		display: flex;
		gap: 1rem;
		align-items: center;
		justify-content: space-between;
	}

	h2 {
		margin-top: 0.25rem;
		font-size: clamp(1.35rem, 4vw, 2rem);
		letter-spacing: -0.04em;
	}

	.count {
		border-radius: 999px;
		background: rgba(231, 95, 120, 0.12);
		padding: 0.5rem 0.8rem;
		color: #8d3c66;
		font-weight: 800;
	}

	button {
		justify-self: start;
		border: 0;
		border-radius: 999px;
		background: rgba(31, 24, 48, 0.32);
		padding: 0.9rem 1.25rem;
		color: #fff8ef;
		font: inherit;
		font-weight: 800;
		cursor: not-allowed;
	}

	@media (max-width: 44rem) {
		.playlist-summary {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
