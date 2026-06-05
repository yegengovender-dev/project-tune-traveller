<script lang="ts">
	import { navigating } from '$app/stores';
	import ConnectedScreen from '$lib/components/connect/ConnectedScreen.svelte';
	import ConnectingScreen from '$lib/components/connect/ConnectingScreen.svelte';
	import ConnectionError from '$lib/components/connect/ConnectionError.svelte';
	import ConnectScreen from '$lib/components/connect/ConnectScreen.svelte';
	import NoSongsScreen from '$lib/components/connect/NoSongsScreen.svelte';
	import { setConnectionContext } from '$lib/state/connection.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const connection = setConnectionContext(data.status);

	$effect(() => {
		connection.status = $navigating ? 'connecting' : data.status;
	});
</script>

<svelte:head>
	<title>Connect YouTube Music | Tune Traveller</title>
	<meta
		name="description"
		content="Connect YouTube Music to import your favourites playlist into Tune Traveller."
	/>
</svelte:head>

<main class="shell">
	{#if connection.status === 'connecting'}
		<ConnectingScreen />
	{:else if data.status === 'not-connected'}
		<ConnectScreen />
	{:else if data.status === 'connected'}
		<ConnectedScreen account={data.account} playlist={data.playlist} />
	{:else if data.status === 'connected-empty'}
		<NoSongsScreen account={data.account} />
	{:else}
		<ConnectionError message={data.message} />
	{/if}
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
		box-sizing: border-box;
		width: min(100%, 68rem);
		min-height: 100vh;
		margin: 0 auto;
		padding: clamp(2rem, 6vw, 5rem);
	}
</style>
