import type { NavItem } from '@indy-center/centerline-svelte';
import {
	mdiCalendarMonth,
	mdiCalendarPlus,
	mdiClipboardListOutline,
	mdiHome,
	mdiSchool,
	mdiShieldAccount,
	mdiViewDashboard
} from '@mdi/js';
import { ROLE_MENTOR, ROLE_STAFF, ROLE_STUDENT } from '$lib/utils';

// Scheddy presents itself as part of the training site, so its header opens
// with the same two links training.flyindycenter.com has.
export const COMMUNITY_URL = 'https://flyindycenter.com';
export const TRAINING_URL = 'https://training.flyindycenter.com';

const home: NavItem = { label: 'Home', href: COMMUNITY_URL, icon: mdiHome };
const myTraining: NavItem = { label: 'My Training', href: TRAINING_URL, icon: mdiSchool };

/** The header's navigation for a member with `role`; signed out (`null`), just Home. */
export function navFor(role: number | null, userId?: number): NavItem[] {
	if (role === null) return [home];

	const items: NavItem[] = [home, myTraining];

	if (role >= ROLE_MENTOR) {
		// Mentors book from the Scheduling menu; the bar opens their dashboard.
		items.push(
			{ label: 'Dashboard', href: '/dash', icon: mdiViewDashboard },
			{ label: 'My Sessions', href: '/my_sessions', icon: mdiClipboardListOutline },
			{
				label: 'Scheduling',
				icon: mdiCalendarMonth,
				children: [
					{ label: 'Book a Session', href: '/schedule' },
					{ label: 'My Schedule', href: `/dash/mentors/${userId}` },
					{ label: 'Cancelled Sessions', href: '/dash/cal/cancelled' },
					{ label: 'Facility Calendar', href: '/dash/cal' },
					{ label: 'Transfer Requests', href: '/dash/cal/transfer_requests' }
				]
			}
		);
	} else if (role >= ROLE_STUDENT) {
		// Students have no Scheduling menu, so booking stays in the bar.
		items.push(
			{ label: 'My Sessions', href: '/my_sessions', icon: mdiClipboardListOutline },
			{ label: 'Book a Session', href: '/schedule', icon: mdiCalendarPlus }
		);
	}
	if (role >= ROLE_STAFF) {
		items.push({
			label: 'Admin',
			icon: mdiShieldAccount,
			children: [
				{ label: 'Users', href: '/dash/users' },
				{ label: 'Mentors', href: '/dash/mentors' },
				{ label: 'Session Types', href: '/dash/types' },
				{ label: 'Role Overrides', href: '/dash/users/set' },
				{ label: 'Blocked Users', href: '/dash/users/blocked' },
				{ label: 'Resync a User', href: '/dash/users/resync' }
			]
		});
	}
	return items;
}

/** Where a member lands after signing in, or on Scheddy's home: mentors and up
 *  get their dashboard; students (who can't open it) get My Sessions. */
export function landingPath(role: number): string {
	return role >= ROLE_MENTOR ? '/dash' : '/my_sessions';
}
