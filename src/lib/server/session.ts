import type { Cookies } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from '$lib/server/db';
import { userTokens } from '$lib/server/db/schema';
import { serverConfig } from '$lib/config/server';

export const SESSION_COOKIE = 'scheddy_token';
export const OAUTH_STATE_COOKIE = 'scheddy_oauth_state';

const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
// Sessions with less than this much time left are extended on use.
const SESSION_REFRESH_THRESHOLD_MS = 15 * 24 * 60 * 60 * 1000;
const OAUTH_STATE_MAX_AGE_SECONDS = 10 * 60;

function cookieOptions(maxAgeSeconds: number) {
	return {
		path: '/',
		httpOnly: true,
		secure: serverConfig.site.base_public.startsWith('https://'),
		sameSite: 'lax' as const,
		maxAge: maxAgeSeconds
	};
}

export function callbackUrl(): string {
	return new URL('callback', serverConfig.site.base_public).toString();
}

export async function createSession(cookies: Cookies, userId: number): Promise<void> {
	const now = Date.now();
	const token = nanoid();
	await db.insert(userTokens).values({
		id: token,
		user: userId,
		createdAt: now,
		expiresAt: now + SESSION_LIFETIME_MS
	});
	cookies.set(SESSION_COOKIE, token, cookieOptions(SESSION_LIFETIME_MS / 1000));
}

// Returns the token row if it is valid, extending it when it is close to
// expiry. Expired tokens are deleted and the cookie cleared.
export async function validateSession(
	cookies: Cookies,
	token: typeof userTokens.$inferSelect
): Promise<boolean> {
	const now = Date.now();
	if (token.expiresAt < now) {
		await db.delete(userTokens).where(eq(userTokens.id, token.id));
		cookies.delete(SESSION_COOKIE, { path: '/' });
		return false;
	}
	if (token.expiresAt - now < SESSION_REFRESH_THRESHOLD_MS) {
		const expiresAt = now + SESSION_LIFETIME_MS;
		await db.update(userTokens).set({ expiresAt }).where(eq(userTokens.id, token.id));
		cookies.set(SESSION_COOKIE, token.id, cookieOptions(SESSION_LIFETIME_MS / 1000));
	}
	return true;
}

export async function destroySession(cookies: Cookies): Promise<void> {
	const token = cookies.get(SESSION_COOKIE);
	if (token) {
		await db.delete(userTokens).where(eq(userTokens.id, token));
	}
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

export function createOAuthState(cookies: Cookies): string {
	const state = nanoid(32);
	cookies.set(OAUTH_STATE_COOKIE, state, cookieOptions(OAUTH_STATE_MAX_AGE_SECONDS));
	return state;
}

// Checks the state returned by the OAuth provider against the cookie set in
// /login. The cookie is single-use and cleared either way.
export function consumeOAuthState(cookies: Cookies, returnedState: string | null): boolean {
	const expected = cookies.get(OAUTH_STATE_COOKIE);
	cookies.delete(OAUTH_STATE_COOKIE, { path: '/' });
	return !!expected && !!returnedState && expected === returnedState;
}
