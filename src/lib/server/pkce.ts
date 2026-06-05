const PKCE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

function base64UrlEncode(bytes: ArrayBuffer): string {
	return Buffer.from(bytes).toString('base64url');
}

export function generateCodeVerifier(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(128));

	return Array.from(bytes, (byte) => PKCE_ALPHABET[byte % PKCE_ALPHABET.length]).join('');
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
	const data = new TextEncoder().encode(verifier);
	const digest = await crypto.subtle.digest('SHA-256', data);

	return base64UrlEncode(digest);
}
