import { redirect, type RequestHandler } from '@sveltejs/kit';
import { exchangeCodeForTokens } from '$lib/server/youtube';
import { setAuthCookie } from '$lib/server/session';

const OAUTH_STATE_COOKIE = 'tt_oauth_state';
const PKCE_VERIFIER_COOKIE = 'tt_pkce_verifier';
const OAUTH_COOKIE_PATH = '/connect';

function clearOAuthCookies(cookies: Parameters<RequestHandler>[0]['cookies']): void {
	cookies.delete(OAUTH_STATE_COOKIE, { path: OAUTH_COOKIE_PATH });
	cookies.delete(PKCE_VERIFIER_COOKIE, { path: OAUTH_COOKIE_PATH });
}

function callbackFailed(): never {
	redirect(303, '/connect?error=callback_failed');
}

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get(OAUTH_STATE_COOKIE);
	const verifier = cookies.get(PKCE_VERIFIER_COOKIE);

	if (url.searchParams.has('error') || !code || !state || !storedState || !verifier) {
		clearOAuthCookies(cookies);
		callbackFailed();
	}

	if (state !== storedState) {
		clearOAuthCookies(cookies);
		callbackFailed();
	}

	try {
		const tokens = await exchangeCodeForTokens(code, verifier);
		await setAuthCookie(cookies, tokens);
		clearOAuthCookies(cookies);
	} catch {
		clearOAuthCookies(cookies);
		callbackFailed();
	}

	redirect(303, '/connect');
};
