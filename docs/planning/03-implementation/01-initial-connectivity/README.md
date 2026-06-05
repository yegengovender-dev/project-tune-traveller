# 3.1 Initial Connectivity — Implementation Plan

## Goal

Implement the screens, state management, API integration, and routing defined in
[2.1 Initial Connectivity Design](../../02-design/01-initial-connectivity/).

---

## Technical decisions

### Framework and rendering

- **SvelteKit 2 + Svelte 5 runes mode** (already configured in `svelte.config.js`).
- All reactive state uses the runes API (`$state`, `$derived`, `$effect`). No legacy stores.
- UI lives in a single `/connect` route so state transitions feel continuous, matching the design
  requirement to "keep the user on the same page."

### YouTube Music API

YouTube Music has no standalone public API. The correct surface is **Google's YouTube Data API v3**
with a Google OAuth 2.0 authorisation flow. The user's "favourites" map to the YouTube **Liked
Videos** playlist, accessible via the reserved playlist ID `LL`.

OAuth scopes required:

| Scope                                              | Purpose                                              |
| -------------------------------------------------- | ---------------------------------------------------- |
| `https://www.googleapis.com/auth/youtube.readonly` | Read playlist items                                  |
| `openid`                                           | Identify the signed-in account (display name, email) |
| `profile`                                          | Account display name                                 |
| `email`                                            | Account email address                                |

Song fields returned by `playlistItems.list` (via `snippet` part):

| Design field | YouTube API field                                                                             |
| ------------ | --------------------------------------------------------------------------------------------- |
| Song name    | `snippet.title`                                                                               |
| Artist name  | `snippet.videoOwnerChannelTitle` (or `snippet.description` parsing)                           |
| Album name   | Not directly available; use `contentDetails.videoId` to call `videos.list` for `snippet.tags` |
| Release data | `contentDetails.videoPublishedAt`                                                             |

> **Risk — artist/album fidelity.** The YouTube Data API does not expose structured artist and album
> metadata on playlist items. A supplemental call to `videos.list` with the `snippet` part returns
> `tags` which may carry artist/album for music videos, but this is unreliable. For the first
> version, use `snippet.videoOwnerChannelTitle` as artist and leave album as an optional field that
> is populated when available. Document this limitation clearly in the UI copy.

### Authentication session

Tokens must not be exposed to the browser. Use **HTTP-only, Secure, SameSite=Lax cookies** to
store the access token and refresh token server-side via SvelteKit's server hooks.

Flow:

1. Server generates and stores a PKCE `code_verifier` in a short-lived cookie.
2. Server redirects the browser to Google's OAuth consent screen.
3. Google redirects back to `/connect/callback`.
4. Callback route exchanges the code for tokens, stores them in an `auth` cookie (HTTP-only), and
   redirects to `/connect`.
5. The `/connect` load function reads the token cookie and fetches songs server-side.
6. Disconnect clears the cookie.

### Data fetching strategy

Fetch playlist items **server-side inside the SvelteKit `load` function** so:

- The access token never reaches the browser.
- Progressive pagination is handled before the page renders.
- The `SongList` component receives plain, serialisable data.

Pagination: YouTube returns a maximum of 50 items per page. Fetch all pages on first load (up to a
reasonable cap — 500 songs / 10 pages for the first version) and pass the full list to the client.

### Environment variables

All credentials and secrets go in `.env` (gitignored). Expose only non-secret values to the client
via the `PUBLIC_` prefix.

| Variable               | Side            | Purpose                                                      |
| ---------------------- | --------------- | ------------------------------------------------------------ |
| `GOOGLE_CLIENT_ID`     | server          | OAuth client ID                                              |
| `GOOGLE_CLIENT_SECRET` | server          | OAuth client secret                                          |
| `GOOGLE_REDIRECT_URI`  | server          | Callback URL (e.g. `http://localhost:5173/connect/callback`) |
| `AUTH_COOKIE_SECRET`   | server          | Secret for signing the auth cookie (32+ byte random string)  |
| `PUBLIC_APP_URL`       | client + server | Base URL used to construct absolute links                    |

---

## File inventory

Every file listed below is **new** unless marked `(modify)`.

### Types

```
src/lib/types/music.ts
```

Defines `Song`, `Playlist`, `ConnectedAccount`, and the `ConnectionStatus` union type.

### Server utilities

```
src/lib/server/youtube.ts
```

Wraps YouTube Data API v3 calls. Exports:

- `buildOAuthUrl(state, codeChallenge)` — returns the Google consent URL.
- `exchangeCodeForTokens(code, codeVerifier)` — returns `{ accessToken, refreshToken, expiresAt }`.
- `refreshAccessToken(refreshToken)` — returns a new `accessToken`.
- `fetchLikedSongs(accessToken)` — paginates `playlistItems.list` and returns `Song[]`.
- `fetchAccountInfo(accessToken)` — returns `ConnectedAccount`.

```
src/lib/server/session.ts
```

Cookie helpers:

- `setAuthCookie(cookies, tokens)` — writes the HTTP-only auth cookie.
- `clearAuthCookie(cookies)` — deletes the auth cookie.
- `getAuthCookie(cookies)` — reads and validates the cookie, returns tokens or `null`.

```
src/lib/server/pkce.ts
```

PKCE helpers:

- `generateCodeVerifier()` — returns a 128-character random string.
- `generateCodeChallenge(verifier)` — returns the S256 challenge.

### State (client-side runes)

```
src/lib/state/connection.svelte.ts
```

A module-level rune context that holds the current `ConnectionStatus` and exposes it across
components without prop-drilling. Uses `$state` and exports a `getConnectionContext()` /
`setConnectionContext()` pair using Svelte context.

### Components

```
src/lib/components/connect/ConnectScreen.svelte
src/lib/components/connect/ConnectingScreen.svelte
src/lib/components/connect/ConnectedScreen.svelte
src/lib/components/connect/NoSongsScreen.svelte
src/lib/components/connect/ConnectionError.svelte
src/lib/components/connect/SongList.svelte
src/lib/components/connect/SongItem.svelte
src/lib/components/connect/AccountBadge.svelte
```

| Component          | Rendered for state                                |
| ------------------ | ------------------------------------------------- |
| `ConnectScreen`    | `not-connected`                                   |
| `ConnectingScreen` | `connecting`                                      |
| `ConnectedScreen`  | `connected` (composes `AccountBadge`, `SongList`) |
| `NoSongsScreen`    | `connected-empty`                                 |
| `ConnectionError`  | `error`                                           |
| `SongList`         | child of `ConnectedScreen`                        |
| `SongItem`         | child of `SongList`                               |
| `AccountBadge`     | child of `ConnectedScreen` and `NoSongsScreen`    |

### Routes

```
src/routes/connect/+page.svelte          (new)
src/routes/connect/+page.server.ts       (new)
src/routes/connect/callback/+server.ts   (new)
src/routes/+page.svelte                  (modify)
```

The root `+page.svelte` gains a "Get started" CTA linking to `/connect`. All connection logic lives
under `/connect`.

### Configuration

```
.env.example    (new — committed, documents required variables without values)
src/app.d.ts    (modify — add Locals type for session data)
```

---

## Data model

```typescript
// src/lib/types/music.ts

export type ConnectionStatus =
	| 'not-connected'
	| 'connecting'
	| 'connected'
	| 'connected-empty'
	| 'error';

export interface Song {
	id: string;
	title: string;
	artist: string;
	album: string | null;
	releasedAt: string | null;
	thumbnailUrl: string | null;
}

export interface Playlist {
	title: string;
	totalItems: number;
	songs: Song[];
}

export interface ConnectedAccount {
	id: string;
	displayName: string;
	email: string;
	avatarUrl: string | null;
}

export interface ConnectedPageData {
	status: 'connected';
	account: ConnectedAccount;
	playlist: Playlist;
}

export interface ConnectedEmptyPageData {
	status: 'connected-empty';
	account: ConnectedAccount;
}

export interface ErrorPageData {
	status: 'error';
	message: string;
}

export interface NotConnectedPageData {
	status: 'not-connected';
}

export type PageData =
	| NotConnectedPageData
	| ConnectedPageData
	| ConnectedEmptyPageData
	| ErrorPageData;
```

---

## Route behaviour

### `src/routes/connect/+page.server.ts`

**`load` function:**

1. Read the auth cookie via `getAuthCookie(cookies)`.
2. If no token: return `{ status: 'not-connected' }`.
3. If token present: call `fetchAccountInfo` and `fetchLikedSongs`.
   - On API error: return `{ status: 'error', message }`.
   - On empty result: return `{ status: 'connected-empty', account }`.
   - On success: return `{ status: 'connected', account, playlist }`.

**`actions.connect`:**

1. Generate PKCE verifier + challenge.
2. Store verifier in a short-lived HTTP-only cookie (`pkce_verifier`).
3. Generate a CSRF `state` token, store in a cookie.
4. Build OAuth URL via `buildOAuthUrl(state, challenge)`.
5. `redirect(303, oauthUrl)`.

**`actions.disconnect`:**

1. Call `clearAuthCookie(cookies)`.
2. `redirect(303, '/connect')`.

### `src/routes/connect/callback/+server.ts`

**`GET` handler:**

1. Read `code` and `state` from URL search params.
2. Validate `state` against the stored CSRF cookie.
3. Read `pkce_verifier` cookie.
4. Call `exchangeCodeForTokens(code, verifier)`.
5. Call `setAuthCookie(cookies, tokens)`.
6. Clear PKCE and CSRF cookies.
7. `redirect(303, '/connect')`.
8. On any error: `redirect(303, '/connect?error=callback_failed')`.

---

## Ordered implementation steps

The steps are ordered to keep the app in a runnable state at each checkpoint.

### Step 1 — Environment and types

1. Create `.env.example` with all required variable names.
2. Add `Song`, `Playlist`, `ConnectedAccount`, `ConnectionStatus`, and page data types to
   `src/lib/types/music.ts`.
3. Update `src/app.d.ts` to declare `App.Locals` with an optional `account` field and `tokens`.

**Checkpoint:** `npm run check` passes.

### Step 2 — PKCE and session helpers

1. Implement `src/lib/server/pkce.ts` using the Web Crypto API (`crypto.subtle`).
2. Implement `src/lib/server/session.ts` for cookie read/write/clear using SvelteKit's `cookies`
   API. Sign the cookie value with `AUTH_COOKIE_SECRET` using HMAC-SHA256.

**Checkpoint:** Unit tests (or manual `node` invocation) confirm PKCE challenge/verify round-trip
and cookie sign/verify.

### Step 3 — YouTube server client

1. Implement `src/lib/server/youtube.ts`.
2. Implement `buildOAuthUrl` and `exchangeCodeForTokens` first, as they are needed for the auth
   flow before any data is fetched.
3. Implement `fetchAccountInfo` and `fetchLikedSongs` with pagination.

**Checkpoint:** Manual test with a valid access token confirms a non-empty `Song[]` is returned.

### Step 4 — OAuth routes

1. Create `src/routes/connect/+page.server.ts` with `load`, `connect` action, and `disconnect`
   action.
2. Create `src/routes/connect/callback/+server.ts`.

**Checkpoint:** Navigating to `/connect` with no cookie returns `{ status: 'not-connected' }` from
the load function. Posting to `?/connect` redirects to Google's consent screen.

### Step 5 — ConnectScreen component

1. Create `src/lib/components/connect/ConnectScreen.svelte`.
   - Headline, supporting text, privacy note.
   - `<form method="POST" action="?/connect">` with the primary connect button.
2. Create `src/routes/connect/+page.svelte`.
   - Import page data and render `<ConnectScreen>` when `data.status === 'not-connected'`.

**Checkpoint:** The `/connect` page shows the connect screen; submitting the form starts the OAuth
redirect.

### Step 6 — ConnectingScreen component

The connecting state is visible after the OAuth redirect returns and while the server load function
is fetching songs. SvelteKit's navigation state (`$app/navigation` `navigating` store) indicates
when a navigation (form submit redirect) is in progress.

1. Create `src/lib/components/connect/ConnectingScreen.svelte`.
   - Progress message, spinner or animated ellipsis.
   - No interactive controls.
2. In `+page.svelte`, import `navigating` from `$app/stores` and render `<ConnectingScreen>` while
   `$navigating !== null`.

**Checkpoint:** After clicking "Connect YouTube Music," the connecting screen appears while the
OAuth flow completes.

### Step 7 — AccountBadge and disconnect

1. Create `src/lib/components/connect/AccountBadge.svelte`.
   - Shows avatar, display name, email.
   - Contains a `<form method="POST" action="?/disconnect">` with a disconnect button.
2. Prepare for use inside `ConnectedScreen` and `NoSongsScreen`.

### Step 8 — SongItem and SongList components

1. Create `src/lib/components/connect/SongItem.svelte`.
   - Renders one `Song`: title, artist, album (if present), release year (if present).
2. Create `src/lib/components/connect/SongList.svelte`.
   - Accepts `songs: Song[]` prop.
   - Renders a `<ul>` of `<SongItem>` instances.
   - Shows total count as a header.

### Step 9 — ConnectedScreen component

1. Create `src/lib/components/connect/ConnectedScreen.svelte`.
   - Composes `AccountBadge` and `SongList`.
   - Shows playlist title and total song count.
   - Includes a "Continue to cross-reference" placeholder link/button for the next planning step.
2. In `+page.svelte`, render `<ConnectedScreen>` when `data.status === 'connected'`.

**Checkpoint:** Full connect flow works end-to-end: connect → OAuth → return → songs displayed.

### Step 10 — NoSongsScreen and ConnectionError components

1. Create `src/lib/components/connect/NoSongsScreen.svelte`.
   - Shows `AccountBadge`.
   - Explains no favourites were found and suggests checking the source library.
2. Create `src/lib/components/connect/ConnectionError.svelte`.
   - Shows the error message.
   - Provides a retry button (links back to `/connect` or re-submits the connect form).
3. Wire both into `+page.svelte` via `data.status`.

**Checkpoint:** All five states are reachable and render correctly.

### Step 11 — Landing page update

1. In `src/routes/+page.svelte`, replace the placeholder CTA link with a "Get started" button
   pointing to `/connect`.

### Step 12 — Lint, type check, and format

1. Run `npm run check` — resolve any TypeScript or Svelte type errors.
2. Run `npm run lint` — resolve any ESLint and Prettier issues.
3. Run `npm run format` if needed.

---

## Open questions and risks

| Topic                 | Detail                                                                                                                                                                                                                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artist/album metadata | YouTube Data API v3 does not expose structured music metadata. The first version uses channel name as artist and omits album when unavailable. A future step could integrate MusicBrainz or the YouTube Music internal API for richer data.                                                     |
| Token refresh         | Access tokens expire after one hour. The first version does not implement background refresh; expired tokens trigger a re-authentication prompt. Refresh token support is a follow-up improvement.                                                                                              |
| Rate limits           | YouTube Data API v3 has a 10,000 unit daily quota. A `playlistItems.list` call costs 1 unit; a `videos.list` call also costs 1 unit per page. Fetching 500 songs requires ~10 + up to 10 extra calls — well within quota for a single user. Production multi-user usage needs quota monitoring. |
| Adapter               | `adapter-auto` is configured. The OAuth callback and server load functions require a Node.js runtime. Deploying to a platform that does not support server-side rendering (e.g. static adapter) is incompatible with this design.                                                               |
| HTTPS in development  | Google OAuth requires a registered redirect URI. For local development, `http://localhost:5173/connect/callback` must be added to the Google Cloud Console OAuth credentials.                                                                                                                   |
