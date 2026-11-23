<script lang="ts">
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { Alert, Button, Card, PageHeader, Text, toast } from '@indy-center/centerline-svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	let busy = $state(false);

	async function cancelSession() {
		busy = true;
		try {
			const resp = await fetch('?', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			});
			if (!resp.ok) {
				toast('danger', "We couldn't cancel the session. Try again.");
				return;
			}
			await invalidateAll();
			await goto('/my_sessions');
			toast('success', 'Session cancelled.');
		} finally {
			busy = false;
		}
	}
</script>

<PageHeader title="Cancel a session" class="mb-6">Your mentor will be told by email.</PageHeader>

<Card class="max-w-xl">
	{#if data.canCancel}
		<Text>Are you sure you want to cancel this session? This can't be undone.</Text>
		<div class="mt-5 flex flex-wrap gap-3">
			<Button variant="danger" onclick={cancelSession} {busy} busyLabel="Cancelling">
				Cancel session
			</Button>
			<Button href="/my_sessions" variant="secondary">Keep session</Button>
		</div>
	{:else}
		<Alert level="caution">
			This session is less than 24 hours away. Please contact your mentor directly to cancel it.
		</Alert>
	{/if}
</Card>
