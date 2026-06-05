import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { Cookies } from '@sveltejs/kit';
import type { AuthTokens } from '$lib/types/music';

const AUTH_COOKIE_NAME = 'tt_auth';
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type SignedCookie = `${string}.${string}`;

const authCookieOptions = {
	httpOnly: true,
	path: '/',
	sameSite: 'lax' as const,
	secure: !dev
};

function requireCookieSecret(): string {
	const secret = env.AUTH_COOKIE_SECRET;

	if (!secret || secret.length < 32) {
		throw new Error('AUTH_COOKIE_SECRET must be at least 32 characters long.');
	}

	return secret;
}

function base64UrlEncode(value: string | ArrayBuffer): string {
	if (typeof value === 'string') {
		return Buffer.from(value, 'utf8').toString('base64url');
	}

	return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value: string): string {
	return Buffer.from(value, 'base64url').toString('utf8');
}

async function sign(payload: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(requireCookieSecret()),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));

	return base64UrlEncode(signature);
}

function safeCompare(left: string, right: string): boolean {
	if (left.length !== right.length) {
		return false;
	}

	let difference = 0;
	for (let index = 0; index < left.length; index += 1) {
		difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
	}

	return difference === 0;
}

function isAuthTokens(value: unknown): value is AuthTokens {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const candidate = value as Partial<AuthTokens>;

	return (
		typeof candidate.accessToken === 'string' &&
		(candidate.refreshToken === null || typeof candidate.refreshToken === 'string') &&
		typeof candidate.expiresAt === 'number'
	);
}

export function isAuthExpired(tokens: AuthTokens): boolean {
	return tokens.expiresAt <= Date.now();
}

export async function setAuthCookie(cookies: Cookies, tokens: AuthTokens): Promise<void> {
	const payload = base64UrlEncode(JSON.stringify(tokens));
	const signature = await sign(payload);

	cookies.set(AUTH_COOKIE_NAME, `${payload}.${signature}`, {
		...authCookieOptions,
		maxAge: AUTH_COOKIE_MAX_AGE_SECONDS
	});
}

export function clearAuthCookie(cookies: Cookies): void {
	cookies.delete(AUTH_COOKIE_NAME, { path: '/' });
}

export async function getAuthCookie(cookies: Cookies): Promise<AuthTokens | null> {
	const cookie = cookies.get(AUTH_COOKIE_NAME) as SignedCookie | undefined;

	if (!cookie) {
		return null;
	}

	const [payload, signature] = cookie.split('.');

	if (!payload || !signature) {
		return null;
	}

	const expectedSignature = await sign(payload);

	if (!safeCompare(signature, expectedSignature)) {
		return null;
	}

	try {
		const parsed: unknown = JSON.parse(base64UrlDecode(payload));

		return isAuthTokens(parsed) ? parsed : null;
	} catch {
		return null;
	}
}
