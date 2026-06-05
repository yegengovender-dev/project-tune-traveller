<script lang="ts">
	import AccountBadge from './AccountBadge.svelte';
	import type { ConnectedAccount } from '$lib/types/music';

	let { account }: { account: ConnectedAccount } = $props();
</script>

<section class="stack" aria-labelledby="empty-title">
	<AccountBadge {account} />

	<div class="card">
		<p class="eyebrow">No favourites found</p>
		<h1 id="empty-title">Your YouTube Music favourites playlist is empty.</h1>
		<p>
			Add a few favourite songs in YouTube Music, then return here to reconnect and import them into
			Tune Traveller.
		</p>
	</div>
</section>

<style>
	.stack {
		display: grid;
		gap: 1.25rem;
	}

	.card {
		border: 1px solid rgba(31, 24, 48, 0.1);
		border-radius: 2rem;
		background: rgba(255, 255, 255, 0.72);
		padding: clamp(1.5rem, 5vw, 3rem);
		box-shadow: 0 1.5rem 4rem rgba(79, 55, 112, 0.14);
	}

	.eyebrow,
	h1,
	p {
		margin: 0;
	}

	.eyebrow {
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #8d3c66;
	}

	h1 {
		max-width: 15ch;
		margin-top: 0.5rem;
		font-size: clamp(2.5rem, 8vw, 4.25rem);
		line-height: 0.95;
		letter-spacing: -0.07em;
	}

	p:not(.eyebrow) {
		max-width: 42rem;
		margin-top: 1rem;
		color: #4d425f;
		line-height: 1.65;
	}
</style>
