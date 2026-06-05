<script lang="ts">
	let { message }: { message: string } = $props();
</script>

<section class="card" role="alert" aria-labelledby="error-title">
	<p class="eyebrow">Connection failed</p>
	<h1 id="error-title">We could not connect your library.</h1>
	<p>{message}</p>

	<form method="POST" action="?/connect">
		<button type="submit">Try connecting again</button>
	</form>
</section>

<style>
	.card {
		display: grid;
		gap: 1.25rem;
		border: 1px solid rgba(231, 95, 120, 0.28);
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
		max-width: 14ch;
		font-size: clamp(2.5rem, 8vw, 4.25rem);
		line-height: 0.95;
		letter-spacing: -0.07em;
	}

	p {
		max-width: 42rem;
		color: #4d425f;
		line-height: 1.65;
	}

	button {
		border: 0;
		border-radius: 999px;
		background: #1f1830;
		padding: 0.9rem 1.25rem;
		color: #fff8ef;
		font: inherit;
		font-weight: 800;
		box-shadow: 0 1rem 2rem rgba(31, 24, 48, 0.18);
		cursor: pointer;
	}

	button:hover {
		background: #332744;
	}
</style>
