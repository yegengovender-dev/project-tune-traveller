<script lang="ts">
	const highlights = [
		'Map destinations to the artists and scenes that shaped them',
		'Collect venues, festivals, record shops, and listening bars in one itinerary',
		'Keep the first version lightweight while the product direction evolves'
	];
</script>

<svelte:head>
	<title>Tune Traveller</title>
	<meta
		name="description"
		content="Plan music-inspired trips with Tune Traveller, a SvelteKit travel app."
	/>
</svelte:head>

<main class="shell">
	<section class="hero" aria-labelledby="hero-title">
		<p class="eyebrow">Project Tune Traveller</p>
		<h1 id="hero-title">Find your next trip through the music you love.</h1>
		<p class="lede">
			Tune Traveller is a Svelte-powered starting point for turning favorite sounds into memorable
			journeys.
		</p>
		<a class="cta" href="https://svelte.dev/docs/kit" rel="noreferrer" target="_blank">
			Explore the SvelteKit docs
		</a>
	</section>

	<section class="panel" aria-label="Project priorities">
		<h2>Initial focus</h2>
		<ul>
			{#each highlights as highlight (highlight)}
				<li>{highlight}</li>
			{/each}
		</ul>
	</section>
</main>

<style>
	:global(body) {
		margin: 0;
		font-family:
			Inter,
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
		color: #1f1830;
		background:
			radial-gradient(circle at top left, rgba(255, 128, 94, 0.28), transparent 32rem),
			linear-gradient(135deg, #fff8ef 0%, #f4f0ff 52%, #eef8ff 100%);
	}

	:global(a) {
		color: inherit;
	}

	.shell {
		display: grid;
		min-height: 100vh;
		box-sizing: border-box;
		gap: 2rem;
		align-items: center;
		padding: clamp(2rem, 6vw, 5rem);
	}

	.hero,
	.panel {
		max-width: 52rem;
	}

	.eyebrow {
		margin: 0 0 1rem;
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #8d3c66;
	}

	h1 {
		max-width: 12ch;
		margin: 0;
		font-size: clamp(3rem, 10vw, 6.5rem);
		line-height: 0.9;
		letter-spacing: -0.08em;
	}

	.lede {
		max-width: 42rem;
		margin: 1.5rem 0 0;
		font-size: clamp(1.15rem, 2vw, 1.45rem);
		line-height: 1.6;
		color: #4d425f;
	}

	.cta {
		display: inline-flex;
		margin-top: 2rem;
		border-radius: 999px;
		background: #1f1830;
		padding: 0.85rem 1.2rem;
		color: #fff8ef;
		font-weight: 700;
		text-decoration: none;
		box-shadow: 0 1rem 2rem rgba(31, 24, 48, 0.18);
	}

	.panel {
		border: 1px solid rgba(31, 24, 48, 0.1);
		border-radius: 1.5rem;
		background: rgba(255, 255, 255, 0.58);
		padding: clamp(1.25rem, 4vw, 2rem);
		box-shadow: 0 1.5rem 4rem rgba(79, 55, 112, 0.12);
		backdrop-filter: blur(18px);
	}

	h2 {
		margin: 0 0 1rem;
		font-size: 1rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	ul {
		display: grid;
		gap: 0.85rem;
		margin: 0;
		padding-left: 1.25rem;
		color: #4d425f;
		font-size: 1rem;
		line-height: 1.55;
	}

	li::marker {
		color: #e75f78;
	}
</style>
