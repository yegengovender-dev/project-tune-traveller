<script lang="ts">
	import type { ConnectedAccount } from '$lib/types/music';

	let { account }: { account: ConnectedAccount } = $props();

	const fallbackInitial = $derived(
		(account.displayName || account.email || 'Y').slice(0, 1).toUpperCase()
	);
</script>

<article class="badge" aria-label="Connected account">
	{#if account.avatarUrl}
		<img src={account.avatarUrl} alt="" referrerpolicy="no-referrer" />
	{:else}
		<span class="avatar" aria-hidden="true">{fallbackInitial}</span>
	{/if}

	<div class="details">
		<p class="label">Connected YouTube Music account</p>
		<p class="name">{account.displayName}</p>
		{#if account.email}
			<p class="email">{account.email}</p>
		{/if}
	</div>

	<form method="POST" action="?/disconnect">
		<button type="submit">Disconnect</button>
	</form>
</article>

<style>
	.badge {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		gap: 1rem;
		align-items: center;
		border: 1px solid rgba(31, 24, 48, 0.1);
		border-radius: 1.25rem;
		background: rgba(255, 255, 255, 0.72);
		padding: 1rem;
	}

	img,
	.avatar {
		width: 3rem;
		height: 3rem;
		border-radius: 999px;
	}

	img {
		object-fit: cover;
	}

	.avatar {
		display: grid;
		place-items: center;
		background: #1f1830;
		color: #fff8ef;
		font-weight: 800;
	}

	.details {
		min-width: 0;
	}

	p {
		margin: 0;
	}

	.label {
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #8d3c66;
	}

	.name,
	.email {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.name {
		margin-top: 0.2rem;
		font-weight: 800;
	}

	.email {
		margin-top: 0.1rem;
		color: #4d425f;
	}

	button {
		border: 1px solid rgba(31, 24, 48, 0.18);
		border-radius: 999px;
		background: transparent;
		padding: 0.65rem 0.95rem;
		color: #1f1830;
		font: inherit;
		font-weight: 800;
		cursor: pointer;
	}

	button:hover {
		background: rgba(31, 24, 48, 0.06);
	}

	@media (max-width: 40rem) {
		.badge {
			grid-template-columns: auto minmax(0, 1fr);
		}

		form {
			grid-column: 1 / -1;
		}
	}
</style>
