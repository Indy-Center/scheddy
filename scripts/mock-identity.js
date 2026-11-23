// Local stand-in for Indy Center identity's OAuth endpoints, for developing
// Scheddy's login before identity's HTTP transport is deployed.
//
// Implements the endpoints documented at
// https://tech.flyindycenter.com/patterns/auth/ and returns the
// SessionContext shape from identity's src/client types. Everything is kept
// in memory, so restarting the mock logs everyone out.
//
//   npm run dev:identity
//   PUBLIC_SCHEDDY_AUTH_IDENTITY_BASE="http://localhost:8787"
//
// /oauth/authorize shows a form to pick which CID to log in as.

import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';

const PORT = Number(process.env.MOCK_IDENTITY_PORT ?? 8787);
const DEFAULT_CID = process.env.MOCK_IDENTITY_CID ?? '10000002';
const CODE_TTL_MS = 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const codes = new Map(); // code -> { cid, clientId, redirectUri, expiresAt }
const sessions = new Map(); // token -> { cid, expiresAt }

// Same allowlist identity enforces: https on flyindycenter.com and its
// subdomains, or http on a loopback address with any port.
function isAllowedRedirect(raw) {
	let url;
	try {
		url = new URL(raw);
	} catch {
		return false;
	}
	if (url.protocol === 'https:') {
		return url.hostname === 'flyindycenter.com' || url.hostname.endsWith('.flyindycenter.com');
	}
	if (url.protocol === 'http:') {
		return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
	}
	return false;
}

function sessionContext(cid, expiresAt) {
	// Mirrors the flat userinfo claims served by id.flyindycenter.com
	return {
		sub: String(cid),
		name: `Mock User ${cid}`,
		given_name: 'Mock',
		family_name: `User ${cid}`,
		preferred_name: null,
		pronouns: null,
		email: `${cid}@example.com`,
		rating: 'S2',
		pilot_rating: 'NEW',
		division: 'USA',
		region: 'AMAS',
		subdivision: null,
		roles: [],
		operating_initials: null,
		active: true
	};
}

function token() {
	return randomBytes(24).toString('base64url');
}

function send(res, status, body, headers = {}) {
	const isJson = typeof body === 'object';
	res.writeHead(status, {
		'Content-Type': isJson ? 'application/json' : 'text/html; charset=utf-8',
		...headers
	});
	res.end(isJson ? JSON.stringify(body) : body);
}

function oauthError(res, status, error, description) {
	send(res, status, { error, error_description: description });
}

async function readForm(req) {
	let body = '';
	for await (const chunk of req) body += chunk;
	return new URLSearchParams(body);
}

function escapeHtml(s) {
	return String(s).replace(
		/[&<>"']/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
	);
}

function bearer(req) {
	const match = /^Bearer (.+)$/.exec(req.headers.authorization ?? '');
	return match ? match[1] : null;
}

function liveSession(tokenValue) {
	const session = tokenValue && sessions.get(tokenValue);
	if (!session) return null;
	if (session.expiresAt < Date.now()) {
		sessions.delete(tokenValue);
		return null;
	}
	return session;
}

const server = createServer(async (req, res) => {
	const url = new URL(req.url, `http://localhost:${PORT}`);
	const route = `${req.method} ${url.pathname}`;

	if (route === 'GET /healthz') {
		return send(res, 200, { ok: true, mock: true });
	}

	if (route === 'GET /oauth/authorize' || route === 'POST /oauth/authorize') {
		const params = req.method === 'POST' ? await readForm(req) : url.searchParams;
		const redirectUri = params.get('redirect_uri');
		const clientId = params.get('client_id');
		// Invalid redirect URIs get a 400 rather than a redirect, like identity.
		if (!redirectUri || !isAllowedRedirect(redirectUri)) {
			return send(res, 400, '<h1>400</h1><p>redirect_uri is missing or not allowed.</p>');
		}
		if (params.get('response_type') !== 'code' || !clientId) {
			const back = new URL(redirectUri);
			back.searchParams.set('error', 'invalid_request');
			back.searchParams.set('error_description', 'response_type=code and client_id are required');
			if (params.get('state')) back.searchParams.set('state', params.get('state'));
			res.writeHead(302, { Location: back.toString() });
			return res.end();
		}

		if (req.method === 'GET') {
			const hidden = ['response_type', 'client_id', 'redirect_uri', 'state']
				.filter((k) => params.has(k))
				.map((k) => `<input type="hidden" name="${k}" value="${escapeHtml(params.get(k))}">`)
				.join('');
			return send(
				res,
				200,
				`<!doctype html><meta charset="utf-8"><title>Mock identity</title>
<body style="font-family:system-ui;max-width:28rem;margin:4rem auto">
<h1>Mock identity</h1>
<p><b>${escapeHtml(clientId)}</b> wants you to log in.</p>
<form method="post">${hidden}
<label>CID <input name="cid" value="${escapeHtml(DEFAULT_CID)}" required pattern="[0-9]+" autofocus></label>
<button>Log in</button>
</form></body>`
			);
		}

		const cid = params.get('cid');
		if (!cid || !/^[0-9]+$/.test(cid)) {
			return send(res, 400, '<h1>400</h1><p>CID must be numeric.</p>');
		}
		const code = token();
		codes.set(code, { cid, clientId, redirectUri, expiresAt: Date.now() + CODE_TTL_MS });
		const back = new URL(redirectUri);
		back.searchParams.set('code', code);
		if (params.get('state')) back.searchParams.set('state', params.get('state'));
		console.log(`[mock-identity] authorized CID ${cid} for ${clientId}`);
		res.writeHead(302, { Location: back.toString() });
		return res.end();
	}

	if (route === 'POST /oauth/token') {
		const form = await readForm(req);
		if (form.get('grant_type') !== 'authorization_code') {
			return oauthError(res, 400, 'unsupported_grant_type', 'Only authorization_code is supported');
		}
		const code = form.get('code');
		const entry = code && codes.get(code);
		codes.delete(code); // single use, even when the exchange fails
		if (!entry || entry.expiresAt < Date.now()) {
			return oauthError(res, 400, 'invalid_grant', 'Code is invalid, expired or already used');
		}
		if (
			entry.redirectUri !== form.get('redirect_uri') ||
			entry.clientId !== form.get('client_id')
		) {
			return oauthError(res, 400, 'invalid_grant', 'redirect_uri or client_id does not match');
		}
		const accessToken = token();
		const expiresAt = Date.now() + SESSION_TTL_MS;
		sessions.set(accessToken, { cid: entry.cid, expiresAt });
		return send(res, 200, {
			access_token: accessToken,
			token_type: 'Bearer',
			expires_in: Math.floor(SESSION_TTL_MS / 1000)
		});
	}

	if (route === 'GET /oauth/userinfo') {
		const session = liveSession(bearer(req));
		if (!session) return oauthError(res, 401, 'invalid_token', 'Not logged in');
		return send(res, 200, sessionContext(session.cid, session.expiresAt));
	}

	if (route === 'POST /oauth/revoke') {
		const form = await readForm(req);
		sessions.delete(form.get('token'));
		return send(res, 200, {});
	}

	if (route === 'GET /logout') {
		// Global logout: identity revokes every session the user has.
		const returnUrl = url.searchParams.get('return_url');
		sessions.clear();
		if (returnUrl && isAllowedRedirect(returnUrl)) {
			res.writeHead(302, { Location: returnUrl });
			return res.end();
		}
		return send(res, 200, '<p>Logged out.</p>');
	}

	send(res, 404, { error: 'not_found' });
});

server.listen(PORT, () => {
	console.log(`[mock-identity] listening on http://localhost:${PORT}`);
});
