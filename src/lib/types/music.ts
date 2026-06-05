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

export interface AuthTokens {
	accessToken: string;
	refreshToken: string | null;
	expiresAt: number;
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
