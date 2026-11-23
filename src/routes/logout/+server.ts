import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';
import { destroySession } from '$lib/server/session';
import { serverConfig } from '$lib/config/server';

// The header's Sign out is a link, so this is a GET. To stop another site
// signing members out with a link or <img>, it only acts on requests from
// Scheddy itself (or typed into the address bar); anything else is sent home.
//
// After ending Scheddy's session it goes through identity's /logout, which
// ends the Indy Center sign-in too, so Sign out means the same in every app.
export const GET: RequestHandler = async ({ cookies, request }) => {
	const site = request.headers.get('sec-fetch-site');
	if (site !== null && site !== 'same-origin' && site !== 'none') {
		redirect(303, '/');
	}

	await destroySession(cookies);

	const identityLogout = new URL('/logout', serverConfig.auth.identity.base_public);
	identityLogout.searchParams.set('return_url', serverConfig.site.base_public);
	redirect(303, identityLogout.toString());
};
