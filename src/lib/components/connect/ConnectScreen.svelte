<section class="card" aria-labelledby="connect-title">
	<p class="eyebrow">First step</p>
	<h1 id="connect-title">Connect your music library</h1>
	<p class="lede">
		Tune Traveller uses your YouTube Music favourites playlist to understand the songs, artists, and
		scenes that could shape your next trip.
	</p>

	<form method="POST" action="?/connect">
		<button type="submit">Connect YouTube Music</button>
	</form>

	<p class="privacy">
		We only request read-only access to the playlist data needed for this import. Tokens are stored
		in HTTP-only cookies and are not exposed to the browser.
	</p>
</section>

<style>
	.card {
		display: grid;
		gap: 1.25rem;
		border: 1px solid rgba(31, 24, 48, 0.1);
		border-radius: 2rem;
		background: rgba(255, 255, 255, 0.72);
		padding: clamp(1.5rem, 5vw, 3rem);
		box-shadow: 0 1.5rem 4rem rgba(79, 55, 112, 0.14);
		backdrop-filter: blur(18px);
	}

	.eyebrow {
		margin: 0;
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: #8d3c66;
	}

	h1 {
		max-width: 12ch;
		margin: 0;
		font-size: clamp(2.75rem, 10vw, 5rem);
		line-height: 0.95;
		letter-spacing: -0.07em;
	}

	.lede,
	.privacy {
		max-width: 42rem;
		margin: 0;
		color: #4d425f;
		line-height: 1.65;
	}

	.lede {
		font-size: clamp(1.1rem, 2vw, 1.35rem);
	}

	.privacy {
		border-left: 0.25rem solid #e75f78;
		padding-left: 1rem;
		font-size: 0.95rem;
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
