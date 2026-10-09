import { base } from '$app/paths';

import { goto, invalidateAll } from '$app/navigation';

export async function logout() {
	await fetch(`${base}/logout`, { method: 'POST' });
	await invalidateAll();
	await goto(`${base}/`);
}
