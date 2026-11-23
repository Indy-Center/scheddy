import { serverConfig } from '$lib/config/server';

// Talks to Indy Center identity's OAuth endpoints over HTTPS. Modeled on
// community-website's src/lib/server/identity.ts, the reference consumer.
// Scheddy is a public client: client_id is just a label, with no secret.
//
// Scheddy only asks identity who the user is. Roles still come from VATUSA,
// and Scheddy keeps its own session once login completes.

// The subset of GET /oauth/userinfo that Scheddy reads. `sub` is the CID.
export type IdentityUserinfo = {
	sub: string;
	name: string;
	email: string;
};

export class IdentityError extends Error {
	constructor(
		public code: string,
		message: string
	) {
		super(message);
	}
}

function endpoint(path: string): string {
	return `${serverConfig.auth.identity.base_public}${path}`;
}

export function authorizeUrl(redirectUri: string, state: string): string {
	const url = new URL(endpoint('/oauth/authorize'));
	url.searchParams.set('response_type', 'code');
	url.searchParams.set('client_id', serverConfig.auth.identity.client_id_public);
	url.searchParams.set('redirect_uri', redirectUri);
	url.searchParams.set('state', state);
	return url.toString();
}

export async function exchangeCode(
	fetch: typeof globalThis.fetch,
	code: string,
	redirectUri: string
): Promise<string> {
	const body = new URLSearchParams({
		grant_type: 'authorization_code',
		code,
		redirect_uri: redirectUri,
		client_id: serverConfig.auth.identity.client_id_public
	});
	const resp = await fetch(endpoint('/oauth/token'), {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	});
	const json = await resp.json().catch(() => ({}));
	if (!resp.ok || typeof json.access_token !== 'string') {
		throw new IdentityError(
			json.error ?? 'token_exchange_failed',
			json.error_description ?? 'Failed to complete login with Indy Center identity.'
		);
	}
	return json.access_token;
}

export async function getUserinfo(
	fetch: typeof globalThis.fetch,
	token: string
): Promise<IdentityUserinfo> {
	const resp = await fetch(endpoint('/oauth/userinfo'), {
		headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
	});
	if (!resp.ok) {
		throw new IdentityError(
			'user_data_failed',
			'Failed to load user data from Indy Center identity.'
		);
	}
	return resp.json();
}

// Scheddy has its own session from here on, so the identity token isn't
// needed after login. Failures are ignored; the token expires on its own.
export async function revokeToken(fetch: typeof globalThis.fetch, token: string): Promise<void> {
	await fetch(endpoint('/oauth/revoke'), {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ token })
	}).catch(() => {});
}

export function cidOf(userinfo: IdentityUserinfo): number {
	const cid = /^\d+$/.test(userinfo.sub) ? Number.parseInt(userinfo.sub, 10) : NaN;
	if (!Number.isSafeInteger(cid) || cid <= 0) {
		throw new IdentityError('invalid_cid', 'Indy Center identity returned an invalid CID.');
	}
	return cid;
}
