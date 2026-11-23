import { goto, invalidateAll } from '$app/navigation';

export async function logout() {
	await fetch('/logout', { method: 'POST' });
	await invalidateAll();
	await goto('/');
}
