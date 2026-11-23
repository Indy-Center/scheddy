<script lang="ts">
	import { DropdownMenu, DropdownMenuItem, toast } from '@indy-center/centerline-svelte';
	import { roleOf } from '$lib';
	import { page } from '$app/state';
	import { ROLE_STAFF } from '$lib/utils';

	interface Props {
		id: string;
		oldMentorId: number;
		newMentorId: number;
	}
	let { id, oldMentorId, newMentorId }: Props = $props();

	const canAnswer = $derived(
		roleOf(page.data.user) >= ROLE_STAFF ||
			oldMentorId === page.data.user.id ||
			newMentorId === page.data.user.id
	);

	async function copyId() {
		await navigator.clipboard.writeText(id);
		toast('success', 'Copied the session ID.');
	}
</script>

<div class="flex justify-end">
	<DropdownMenu label="Actions for this transfer request" text="Actions">
		{#if canAnswer}
			<DropdownMenuItem href="/dash/sessions/{id}">Accept or decline</DropdownMenuItem>
		{/if}
		<DropdownMenuItem onclick={copyId}>Copy session ID</DropdownMenuItem>
	</DropdownMenu>
</div>
