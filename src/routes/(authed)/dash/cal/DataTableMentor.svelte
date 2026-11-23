<script lang="ts">
	import { page } from '$app/state';
	import { Link } from '@indy-center/centerline-svelte';
	import { roleOf } from '$lib';
	import { ROLE_STAFF } from '$lib/utils';

	interface Props {
		firstName: string;
		lastName: string;
		id: number;
	}
	let { firstName, lastName, id }: Props = $props();
</script>

{#if roleOf(page.data.user) >= ROLE_STAFF || id === page.data.user.id}
	<Link href="/dash/mentors/{id}">{firstName} {lastName}</Link>
{:else}
	{firstName} {lastName}
{/if}
