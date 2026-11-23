<script lang="ts">
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { Button, Card, Field, PageHeader, Textarea, toast } from '@indy-center/centerline-svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	let reason = $state('');
	let busy = $state(false);

	async function cancelSession(event: SubmitEvent) {
		event.preventDefault();
		busy = true;
		try {
			const body = new URLSearchParams();
			if (reason.trim()) body.set('reason', reason.trim());
			const resp = await fetch('?/cancel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: body.toString()
			});
			if (!resp.ok) {
				toast('danger', "We couldn't cancel the session. Try again.");
				return;
			}
			await goto(`/dash/mentors/${data.sessionInfo.mentor.id}`);
			toast('success', 'Session cancelled.');
			await invalidateAll();
		} finally {
			busy = false;
		}
	}
</script>

<PageHeader title="Cancel session">The student will be told by email.</PageHeader>

<Card class="max-w-xl">
	<form onsubmit={cancelSession} class="flex flex-col gap-5">
		<Field label="Reason" hint="Shown to the student.">
			{#snippet children(control)}
				<Textarea {...control} rows={3} bind:value={reason} />
			{/snippet}
		</Field>
		<div class="flex flex-wrap gap-3">
			<Button type="submit" variant="danger" {busy} busyLabel="Cancelling">Cancel session</Button>
			<Button href="/dash/sessions/{data.sessionInfo.session.id}" variant="secondary">
				Keep session
			</Button>
		</div>
	</form>
</Card>
