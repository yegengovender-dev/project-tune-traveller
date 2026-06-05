# Planning

## Ordered steps

1. [Brainstorming](./01-brainstorming/)
   1. [Initial connectivity](./01-brainstorming/01-initial-connectivity/)
   2. [Cross reference](./01-brainstorming/02-cross-reference/)
2. [Design](./02-design/)
   1. [Initial connectivity design](./02-design/01-initial-connectivity/)
   2. [Cross reference design](./02-design/02-cross-reference/)
3. [Implementation](./03-implementation/)
   1. [Initial connectivity implementation](./03-implementation/01-initial-connectivity/)

## 1. Brainstorming

### 1.1 Initial connectivity

- log into library - youtube music
- display album - favourites

### 1.2 Cross reference

- log into library - other (eg apple music)
- find matches per song on 2nd library
- display matches and counts
- display non-matches

## 2. Design

### 2.1 Initial connectivity design

- design the YouTube Music connection flow
- design the favourites playlist song display

### 2.2 Cross reference design

- design the second-library connection flow
- design matched, counted, and unmatched song views

## 3. Implementation

### 3.1 Initial connectivity implementation

- OAuth 2.0 + PKCE flow against Google / YouTube Data API v3
- server-side token storage in HTTP-only cookies
- five UI states: not-connected, connecting, connected, connected-empty, error
- SvelteKit server load + form actions; Svelte 5 runes for client state
