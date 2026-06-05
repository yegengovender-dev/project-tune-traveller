import { dev } from '$app/environment';
import { redirect, type Actions } from '@sveltejs/kit';
import { generateCodeChallenge, generateCodeVerifier } from '$lib/server/pkce';
import { clearAuthCookie, getAuthCookie, isAuthExpired } from '$lib/server/session';
import { buildOAuthUrl, fetchAccountInfo, fetchLikedSongs } from '$lib/server/youtube';
import type { PageData } from '$lib/types/music';
import type { PageServerLoad } from './$types';

const OAUTH_STATE_COOKIE = 'tt_oauth_state';
const PKCE_VERIFIER_COOKIE = 'tt_pkce_verifier';
const OAUTH_COOKIE_MAX_AGE_SECONDS = 10 * 60;

const oauthCookieOptions = {
	httpOnly: true,
	maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
	path: '/connect',
	sameSite: 'lax' as const,
	secure: !dev
};

function connectionError(message: string): PageData {
	return {
		status: 'error',
		message
	};
}

export const load: PageServerLoad = async ({ cookies, url }) => {
	if (url.searchParams.has('error')) {
		return connectionError('We could not finish connecting to YouTube Music. Please try again.');
	}

	const tokens = await getAuthCookie(cookies);

	if (!tokens) {
		return {
			status: 'not-connected'
		};
	}

	if (isAuthExpired(tokens)) {
		clearAuthCookie(cookies);

		return connectionError('Your YouTube Music connection expired. Please reconnect to continue.');
	}

	try {
		const [account, songs] = await Promise.all([
			fetchAccountInfo(tokens.accessToken),
			fetchLikedSongs(tokens.accessToken)
		]);

		if (songs.length === 0) {
			return {
				status: 'connected-empty',
				account
			};
		}

		return {
			status: 'connected',
			account,
			playlist: {
				title: 'YouTube Music favourites',
				totalItems: songs.length,
				songs
			}
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Could not load your favourites playlist.';

		return connectionError(message);
	}
};

export const actions: Actions = {
	connect: async ({ cookies }) => {
		const state = crypto.randomUUID();
		const verifier = generateCodeVerifier();
		const challenge = await generateCodeChallenge(verifier);

		cookies.set(OAUTH_STATE_COOKIE, state, oauthCookieOptions);
		cookies.set(PKCE_VERIFIER_COOKIE, verifier, oauthCookieOptions);

		redirect(303, buildOAuthUrl(state, challenge));
	},
	disconnect: async ({ cookies }) => {
		clearAuthCookie(cookies);

		redirect(303, '/connect');
	}
};
