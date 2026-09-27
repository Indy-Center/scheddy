import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { serverConfig } from '$lib/config/server';
import { callbackUrl, createOAuthState } from '$lib/server/session';

// TODO(identity): point at identity's authorize endpoint (and add PKCE if
// supported) once it ships as an OAuth provider.
export const GET: RequestHandler = async ({ cookies }) => {
	const state = createOAuthState(cookies);

	const authorizeUrl = new URL(`${serverConfig.auth.vatsim.base_public}/oauth/authorize`);
	authorizeUrl.searchParams.set('response_type', 'code');
	authorizeUrl.searchParams.set('client_id', serverConfig.auth.vatsim.client_id_public);
	authorizeUrl.searchParams.set('redirect_uri', callbackUrl());
	authorizeUrl.searchParams.set('state', state);

	redirect(302, authorizeUrl.toString());
};
