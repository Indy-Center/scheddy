import type { LayoutServerLoad } from './$types';
import { loadUserData } from '$lib/userInfo';
import { roleOf } from '$lib';
import { navFor } from '$lib/nav';

// What the header needs on every page: who is signed in, and their navigation.
export const load: LayoutServerLoad = async ({ cookies }) => {
	const userData = await loadUserData(cookies, true);
	if (!userData) {
		return { member: undefined, nav: navFor(null) };
	}
	const { user } = userData;
	return {
		member: {
			name: `${user.firstName} ${user.lastName}`,
			cid: user.id,
			rating: user.rating
		},
		nav: navFor(roleOf(user), user.id)
	};
};
