<section class="card" aria-live="polite" aria-labelledby="connecting-title">
	<div class="spinner" aria-hidden="true"></div>
	<div>
		<p class="eyebrow">Connecting</p>
		<h1 id="connecting-title">Connecting to YouTube Music...</h1>
		<p>
			We are verifying your account and importing your favourites playlist. Keep this tab open while
			the connection completes.
		</p>
	</div>
</section>

<style>
	.card {
		display: flex;
		gap: 1.25rem;
		align-items: center;
		border: 1px solid rgba(31, 24, 48, 0.1);
		border-radius: 2rem;
		background: rgba(255, 255, 255, 0.72);
		padding: clamp(1.5rem, 5vw, 3rem);
		box-shadow: 0 1.5rem 4rem rgba(79, 55, 112, 0.14);
	}

	.spinner {
		width: 3rem;
		height: 3rem;
		flex: 0 0 auto;
		border: 0.35rem solid rgba(141, 60, 102, 0.18);
		border-top-color: #8d3c66;
		border-radius: 999px;
		animation: spin 0.9s linear infinite;
	}

	.eyebrow {
		margin: 0 0 0.5rem;
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #8d3c66;
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 6vw, 3rem);
		letter-spacing: -0.05em;
	}

	p {
		max-width: 36rem;
		margin: 0.75rem 0 0;
		color: #4d425f;
		line-height: 1.6;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
