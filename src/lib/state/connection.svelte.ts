import { getContext, setContext } from 'svelte';
import type { ConnectionStatus } from '$lib/types/music';

const CONNECTION_CONTEXT = Symbol('connection');

export interface ConnectionContext {
	status: ConnectionStatus;
}

export function setConnectionContext(initialStatus: ConnectionStatus): ConnectionContext {
	const context = $state<ConnectionContext>({
		status: initialStatus
	});

	setContext(CONNECTION_CONTEXT, context);

	return context;
}

export function getConnectionContext(): ConnectionContext {
	return getContext<ConnectionContext>(CONNECTION_CONTEXT);
}
