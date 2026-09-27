import type { RequestHandler } from './$types';
import { destroySession } from '$lib/server/session';

// POST-only so a cross-site link or <img> can't log users out.
// TODO(identity): also end the identity session once it exposes a logout endpoint.
export const POST: RequestHandler = async ({ cookies }) => {
	await destroySession(cookies);
	return new Response(null, { status: 204 });
};
