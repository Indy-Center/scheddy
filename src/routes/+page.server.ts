import type { PageServerLoad } from './$types';
import { loadUserData } from '$lib/userInfo';
import { redirect } from '@sveltejs/kit';
import { roleOf } from '$lib';
import { landingPath } from '$lib/nav';

export const load: PageServerLoad = async ({ cookies }) => {
	const maybeUser = await loadUserData(cookies, true);
	if (maybeUser) {
		redirect(307, landingPath(roleOf(maybeUser.user)));
	}
};
