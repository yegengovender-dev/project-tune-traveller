// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { AuthTokens, ConnectedAccount } from '$lib/types/music';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			account?: ConnectedAccount;
			tokens?: AuthTokens;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
