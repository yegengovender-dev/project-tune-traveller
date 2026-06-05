import { redirect, type RequestHandler } from '@sveltejs/kit';
import { YouTubeApiError, exchangeCodeForTokens } from '$lib/server/youtube';
import { setAuthCookie } from '$lib/server/session';

const OAUTH_STATE_COOKIE = 'tt_oauth_state';
const PKCE_VERIFIER_COOKIE = 'tt_pkce_verifier';
const OAUTH_COOKIE_PATH = '/connect';

function clearOAuthCookies(cookies: Parameters<RequestHandler>[0]['cookies']): void {
	cookies.delete(OAUTH_STATE_COOKIE, { path: OAUTH_COOKIE_PATH });
	cookies.delete(PKCE_VERIFIER_COOKIE, { path: OAUTH_COOKIE_PATH });
}

function callbackFailed(reason: string): never {
	redirect(303, `/connect?error=${reason}`);
}

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get(OAUTH_STATE_COOKIE);
	const verifier = cookies.get(PKCE_VERIFIER_COOKIE);

	if (url.searchParams.has('error')) {
		clearOAuthCookies(cookies);
		callbackFailed('google_denied');
	}

	if (!code || !state) {
		clearOAuthCookies(cookies);
		callbackFailed('invalid_callback');
	}

	if (!storedState || !verifier) {
		clearOAuthCookies(cookies);
		callbackFailed('stale_callback');
	}

	if (state !== storedState) {
		clearOAuthCookies(cookies);
		callbackFailed('stale_callback');
	}

	try {
		const tokens = await exchangeCodeForTokens(code, verifier);
		await setAuthCookie(cookies, tokens);
		clearOAuthCookies(cookies);
	} catch (error) {
		console.error('YouTube Music OAuth callback failed', error);
		clearOAuthCookies(cookies);
		callbackFailed(error instanceof YouTubeApiError ? 'token_exchange_failed' : 'session_failed');
	}

	redirect(303, '/connect');
};
