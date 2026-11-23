import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { callbackUrl, createOAuthState } from '$lib/server/session';
import { authorizeUrl } from '$lib/server/identity';

export const GET: RequestHandler = async ({ cookies }) => {
	const state = createOAuthState(cookies);
	redirect(302, authorizeUrl(callbackUrl(), state));
};
