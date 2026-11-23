import type { PageServerLoad } from './$types';
import { loadUserData } from '$lib/userInfo';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies }) => {
	const maybeUser = await loadUserData(cookies, true);
	if (maybeUser) {
		redirect(307, '/schedule');
	}
};
