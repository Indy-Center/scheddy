import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { callbackUrl, consumeOAuthState, createSession } from '$lib/server/session';
import { ROLE_DEVELOPER, ROLE_STAFF, ROLE_MENTOR, ROLE_STUDENT } from '$lib/utils';
import { serverConfig } from '$lib/config/server';
import { determineHighestRole } from '$lib/helpers/auth';
import {
	cidOf,
	exchangeCode,
	getUserinfo,
	IdentityError,
	revokeToken
} from '$lib/server/identity';

export const load: PageServerLoad = async ({ cookies, url, fetch }) => {
	if (url.searchParams.has('error')) {
		const error_code: string = url.searchParams.get('error')!;
		const error_description: string = url.searchParams.get('error_description')!;
		const error_message: string = url.searchParams.get('message')!;

		return {
			success: false,
			error_code,
			error_description,
			error_message
		};
	}

	if (!consumeOAuthState(cookies, url.searchParams.get('state'))) {
		return {
			success: false,
			error_code: 'invalid_state',
			error_description: 'Your login attempt expired or was invalid. Please try logging in again.',
			error_message: 'Your login attempt expired or was invalid. Please try logging in again.'
		};
	}

	const code = url.searchParams.get('code');
	if (!code) {
		return {
			success: false,
			error_code: 'no_auth_code',
			error_description: "No auth code was present in identity's response.",
			error_message: "No auth code was present in identity's response."
		};
	}

	let cid: number;
	try {
		const token = await exchangeCode(fetch, code, callbackUrl());
		const userinfo = await getUserinfo(fetch, token);
		cid = cidOf(userinfo);
		await revokeToken(fetch, token);
	} catch (e) {
		if (!(e instanceof IdentityError)) console.error('identity login failed', e);
		const { code, message } =
			e instanceof IdentityError
				? e
				: new IdentityError('identity_unreachable', 'Could not reach Indy Center identity.');
		return {
			success: false,
			error_code: code,
			error_description: message,
			error_message: message
		};
	}

	// DEVELOPMENT: Overwrites the CID for the data request with one in the .env file
	if (serverConfig.site.mode === 'dev') {
		cid = Number.parseInt(serverConfig.site.dev_cid, 10);
	}

	// finally, load the division data from VATUSA
	const vatusa_user_resp = await fetch(
		`${serverConfig.auth.vatusa.base}/user/${cid}?apikey=${serverConfig.auth.vatusa.key}`,
		{
			headers: {
				Authorization: `Bearer ${serverConfig.auth.vatusa.key}`
			}
		}
	);

	if (!vatusa_user_resp.ok) {
		return {
			success: false,
			error_code: 'vatusa_data_failed',
			error_description: 'Failed to load user data from VATUSA.',
			error_message: 'Failed to load user data from VATUSA.'
		};
	}

	const vatusa_info = await vatusa_user_resp.json();

	const highest_role = determineHighestRole(vatusa_info);

	// User must be at least a ROLE_STUDENT to log in
	if (highest_role < ROLE_STUDENT) {
		return {
			success: false,
			error_code: 'not_a_student',
			error_description: `You do not appear to be a student or training staff member of the ${serverConfig.facility.name_public}. If you believe you are receiving this message in error, please contact your facility staff.`,
			error_message: `You do not appear to be a student or training staff member of the ${serverConfig.facility.name_public}. If you believe you are receiving this message in error, please contact your facility staff.`
		};
	}

	await db
		.insert(users)
		.values({
			id: cid,
			firstName: vatusa_info.data.fname,
			lastName: vatusa_info.data.lname,
			email: vatusa_info.data.email,
			role: highest_role,
			roleOverride: 0,
			isVisitor: vatusa_info.data.facility != serverConfig.facility.id,
			rating: vatusa_info.data.rating,
			timezone: 'America/New_York',
			mentorAvailability: 'null',
			allowedSessionTypes: 'null'
		})
		.onDuplicateKeyUpdate({
			set: {
				id: cid,
				firstName: vatusa_info.data.fname,
				lastName: vatusa_info.data.lname,
				email: vatusa_info.data.email,
				role: highest_role,
				isVisitor: vatusa_info.data.facility != serverConfig.facility.id,
				rating: vatusa_info.data.rating
			}
		});

	await createSession(cookies, cid);

	redirect(307, '/schedule');
};
