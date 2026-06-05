import { env } from '$env/dynamic/private';
import type { AuthTokens, ConnectedAccount, Song } from '$lib/types/music';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const YOUTUBE_PLAYLIST_ITEMS_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';
const LIKED_VIDEOS_PLAYLIST_ID = 'LL';
const MAX_PAGES = 10;
const MAX_RESULTS_PER_PAGE = 50;

const OAUTH_SCOPES = [
	'https://www.googleapis.com/auth/youtube.readonly',
	'openid',
	'profile',
	'email'
];

interface TokenResponse {
	access_token: string;
	refresh_token?: string;
	expires_in: number;
}

interface UserInfoResponse {
	sub: string;
	name?: string;
	email?: string;
	picture?: string;
}

interface YouTubeThumbnail {
	url?: string;
	width?: number;
}

interface YouTubePlaylistItem {
	id?: string;
	snippet?: {
		title?: string;
		channelTitle?: string;
		videoOwnerChannelTitle?: string;
		publishedAt?: string;
		resourceId?: {
			videoId?: string;
		};
		thumbnails?: Record<string, YouTubeThumbnail | undefined>;
	};
	contentDetails?: {
		videoId?: string;
		videoPublishedAt?: string;
	};
}

interface PlaylistItemsResponse {
	nextPageToken?: string;
	items?: YouTubePlaylistItem[];
}

interface GoogleApiErrorDetail {
	message?: string;
	reason?: string;
}

interface GoogleApiErrorPayload {
	error_description?: string;
	error?:
		| string
		| {
				code?: number;
				message?: string;
				status?: string;
				errors?: GoogleApiErrorDetail[];
		  };
}

export class YouTubeApiError extends Error {
	constructor(
		message: string,
		readonly status?: number
	) {
		super(message);
		this.name = 'YouTubeApiError';
	}
}

function requireEnv(name: string): string {
	const value = env[name];

	if (!value) {
		throw new YouTubeApiError(`${name} is not configured.`);
	}

	return value;
}

export function validateYouTubeOAuthConfig(): void {
	requireEnv('GOOGLE_CLIENT_ID');
	requireEnv('GOOGLE_CLIENT_SECRET');
	requireEnv('GOOGLE_REDIRECT_URI');
}

function assertTokenResponse(value: unknown): asserts value is TokenResponse {
	const response = value as Partial<TokenResponse>;

	if (
		!response ||
		typeof response.access_token !== 'string' ||
		typeof response.expires_in !== 'number'
	) {
		throw new YouTubeApiError('Google returned an invalid token response.');
	}
}

function assertUserInfoResponse(value: unknown): asserts value is UserInfoResponse {
	const response = value as Partial<UserInfoResponse>;

	if (!response || typeof response.sub !== 'string') {
		throw new YouTubeApiError('Google returned an invalid account response.');
	}
}

function extractGoogleErrorDetail(body: unknown): string | null {
	if (!body || typeof body !== 'object') {
		return null;
	}

	const payload = body as GoogleApiErrorPayload;

	if (typeof payload.error_description === 'string') {
		return payload.error_description;
	}

	if (typeof payload.error === 'string') {
		return payload.error;
	}

	if (!payload.error || typeof payload.error !== 'object') {
		return null;
	}

	const parts = [
		payload.error.message,
		payload.error.status,
		...(payload.error.errors ?? []).flatMap((detail) => [detail.message, detail.reason])
	].filter((part): part is string => Boolean(part));

	return parts.length > 0 ? [...new Set(parts)].join(' ') : null;
}

function buildErrorMessage(response: Response, fallbackMessage: string, body: unknown): string {
	const detail = extractGoogleErrorDetail(body);

	if (response.status === 403 && fallbackMessage.includes('favourites playlist')) {
		const guidance =
			'Make sure the Google Cloud project has YouTube Data API v3 enabled and the signed-in account can access YouTube Music.';

		return detail
			? `YouTube blocked access to the favourites playlist: ${detail}. ${guidance}`
			: `YouTube blocked access to the favourites playlist. ${guidance}`;
	}

	return detail ?? fallbackMessage;
}

async function readJsonResponse(response: Response, fallbackMessage: string): Promise<unknown> {
	if (response.ok) {
		return response.json();
	}

	let message = fallbackMessage;

	try {
		const body: unknown = await response.json();
		message = buildErrorMessage(response, fallbackMessage, body);
	} catch {
		// The status text below still gives callers enough context.
	}

	throw new YouTubeApiError(
		`${message} (${response.status} ${response.statusText})`,
		response.status
	);
}

function buildTokenPayload(extra: Record<string, string>): URLSearchParams {
	return new URLSearchParams({
		client_id: requireEnv('GOOGLE_CLIENT_ID'),
		client_secret: requireEnv('GOOGLE_CLIENT_SECRET'),
		...extra
	});
}

function chooseThumbnail(
	thumbnails: Record<string, YouTubeThumbnail | undefined> | undefined
): string | null {
	if (!thumbnails) {
		return null;
	}

	const best = Object.values(thumbnails)
		.filter((thumbnail): thumbnail is YouTubeThumbnail => Boolean(thumbnail?.url))
		.sort((left, right) => (right.width ?? 0) - (left.width ?? 0))[0];

	return best?.url ?? null;
}

function cleanArtistName(value: string | undefined): string {
	return value?.replace(/\s+-\s+Topic$/i, '').trim() || 'Unknown artist';
}

function mapPlaylistItemToSong(item: YouTubePlaylistItem): Song | null {
	const videoId = item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId ?? item.id;
	const title = item.snippet?.title;

	if (!videoId || !title) {
		return null;
	}

	return {
		id: videoId,
		title,
		artist: cleanArtistName(item.snippet?.videoOwnerChannelTitle ?? item.snippet?.channelTitle),
		album: null,
		releasedAt: item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt ?? null,
		thumbnailUrl: chooseThumbnail(item.snippet?.thumbnails)
	};
}

export function buildOAuthUrl(state: string, codeChallenge: string): string {
	const url = new URL(GOOGLE_AUTH_URL);

	url.search = new URLSearchParams({
		client_id: requireEnv('GOOGLE_CLIENT_ID'),
		redirect_uri: requireEnv('GOOGLE_REDIRECT_URI'),
		response_type: 'code',
		scope: OAUTH_SCOPES.join(' '),
		state,
		code_challenge: codeChallenge,
		code_challenge_method: 'S256',
		access_type: 'offline',
		prompt: 'consent'
	}).toString();

	return url.toString();
}

export async function exchangeCodeForTokens(
	code: string,
	codeVerifier: string
): Promise<AuthTokens> {
	const response = await fetch(GOOGLE_TOKEN_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: buildTokenPayload({
			code,
			code_verifier: codeVerifier,
			grant_type: 'authorization_code',
			redirect_uri: requireEnv('GOOGLE_REDIRECT_URI')
		})
	});

	const body: unknown = await readJsonResponse(response, 'Google token exchange failed');
	assertTokenResponse(body);

	return {
		accessToken: body.access_token,
		refreshToken: body.refresh_token ?? null,
		expiresAt: Date.now() + body.expires_in * 1000
	};
}

export async function refreshAccessToken(
	refreshToken: string
): Promise<Pick<AuthTokens, 'accessToken' | 'expiresAt'>> {
	const response = await fetch(GOOGLE_TOKEN_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: buildTokenPayload({
			refresh_token: refreshToken,
			grant_type: 'refresh_token'
		})
	});

	const body: unknown = await readJsonResponse(response, 'Google token refresh failed');
	assertTokenResponse(body);

	return {
		accessToken: body.access_token,
		expiresAt: Date.now() + body.expires_in * 1000
	};
}

export async function fetchAccountInfo(accessToken: string): Promise<ConnectedAccount> {
	const response = await fetch(GOOGLE_USERINFO_URL, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	const body: unknown = await readJsonResponse(response, 'Could not load connected Google account');
	assertUserInfoResponse(body);

	return {
		id: body.sub,
		displayName: body.name ?? body.email ?? 'YouTube Music account',
		email: body.email ?? '',
		avatarUrl: body.picture ?? null
	};
}

export async function fetchLikedSongs(accessToken: string): Promise<Song[]> {
	const songs: Song[] = [];
	let pageToken: string | undefined;

	for (let page = 0; page < MAX_PAGES; page += 1) {
		const url = new URL(YOUTUBE_PLAYLIST_ITEMS_URL);
		url.search = new URLSearchParams({
			part: 'snippet,contentDetails',
			playlistId: LIKED_VIDEOS_PLAYLIST_ID,
			maxResults: String(MAX_RESULTS_PER_PAGE),
			...(pageToken ? { pageToken } : {})
		}).toString();

		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});
		const body = (await readJsonResponse(
			response,
			'Could not load the YouTube Music favourites playlist'
		)) as PlaylistItemsResponse;

		for (const item of body.items ?? []) {
			const song = mapPlaylistItemToSong(item);

			if (song) {
				songs.push(song);
			}
		}

		pageToken = body.nextPageToken;

		if (!pageToken) {
			break;
		}
	}

	return songs;
}
