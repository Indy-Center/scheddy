<script lang="ts">
	import { DropdownMenu, DropdownMenuItem, toast } from '@indy-center/centerline-svelte';
	import { roleOf } from '$lib';
	import { page } from '$app/state';
	import { ROLE_STAFF } from '$lib/utils';

	interface Props {
		id: string;
		mentorId: number;
	}
	let { id, mentorId }: Props = $props();

	async function copyId() {
		await navigator.clipboard.writeText(id);
		toast('success', 'Copied the session ID.');
	}
</script>

<div class="flex justify-end">
	<DropdownMenu label="Actions for this session" text="Actions">
		{#if roleOf(page.data.user) >= ROLE_STAFF || mentorId === page.data.user.id}
			<DropdownMenuItem href="/dash/sessions/{id}">Edit</DropdownMenuItem>
		{/if}
		<DropdownMenuItem onclick={copyId}>Copy session ID</DropdownMenuItem>
	</DropdownMenu>
</div>
