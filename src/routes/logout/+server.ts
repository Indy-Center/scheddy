import type { RequestHandler } from './$types';
import { destroySession } from '$lib/server/session';

// POST-only so a cross-site link or <img> can't log users out. This only ends
// the Scheddy session; the identity token was already revoked at login.
export const POST: RequestHandler = async ({ cookies }) => {
	await destroySession(cookies);
	return new Response(null, { status: 204 });
};
