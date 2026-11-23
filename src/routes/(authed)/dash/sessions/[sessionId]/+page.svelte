<script lang="ts">
	import type { PageData } from './$types';
	import { DateTime } from 'luxon';
	import {
		Alert,
		Button,
		Card,
		DescriptionList,
		PageHeader,
		confirmAction,
		toast
	} from '@indy-center/centerline-svelte';
	import { roleOf } from '$lib';
	import { ROLE_STAFF, roleString } from '$lib/utils';
	import { goto, invalidateAll } from '$app/navigation';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const info = $derived(data.sessionInfo);

	async function post(action: string): Promise<boolean> {
		const resp = await fetch(`?/${action}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		});
		if (!resp.ok) {
			toast('danger', 'Something went wrong. Try again.');
		}
		return resp.ok;
	}

	async function accept() {
		if (!(await post('accept'))) return;
		toast('success', 'Transfer accepted. The session is yours.');
		await invalidateAll();
	}

	async function decline() {
		const sure = await confirmAction({
			title: 'Decline this transfer?',
			message: 'The session stays with its current mentor.',
			confirmLabel: 'Decline transfer',
			danger: true
		});
		if (!sure || !(await post('decline'))) return;
		await goto(`/dash/mentors/${data.user.id}`);
		toast('success', 'Transfer declined.');
		await invalidateAll();
	}

	async function cancelRequest() {
		if (!(await post('cancel'))) return;
		toast('success', 'Transfer request withdrawn.');
		await invalidateAll();
	}
</script>

<PageHeader title={info.sessionType.name}>
	{info.student.firstName}
	{info.student.lastName} with {info.mentor.firstName}
	{info.mentor.lastName}
</PageHeader>

{#if data.newMentor}
	<Alert level="info" title="Transfer request" class="max-w-2xl">
		This session's mentor has asked you to take it over.
	</Alert>
{:else if data.pendingTransfer && data.isMentor}
	<Alert level="info" class="max-w-2xl">You've asked another mentor to take this session.</Alert>
{/if}

<Card class="max-w-2xl">
	<DescriptionList>
		<div>
			<dt>Student</dt>
			<dd>{info.student.firstName} {info.student.lastName}</dd>
		</div>
		<div>
			<dt>Mentor</dt>
			<dd>{info.mentor.firstName} {info.mentor.lastName}</dd>
		</div>
		<div>
			<dt>Date</dt>
			<dd>{DateTime.fromISO(info.session.start).toLocaleString(DateTime.DATETIME_HUGE)}</dd>
		</div>
		<div>
			<dt>Length</dt>
			<dd>{info.sessionType.length} minutes</dd>
		</div>
		{#if roleOf(data.user) >= ROLE_STAFF}
			<div>
				<dt>Created by</dt>
				<dd>{data.createdBy}</dd>
			</div>
		{/if}
		{#if info.session.cancelled}
			<div>
				<dt>Cancelled</dt>
				<dd>
					By {roleString(info.session.cancellationUserLevel ?? 0).toLowerCase()}:
					{info.session.cancellationReason}
				</dd>
			</div>
		{/if}
	</DescriptionList>
</Card>

<div class="flex flex-wrap gap-3">
	{#if data.newMentor}
		<Button onclick={accept}>Accept transfer</Button>
		<Button variant="danger" onclick={decline}>Decline</Button>
	{/if}
	{#if data.isMentor}
		<Button href="/dash/sessions/{info.session.id}/edit" variant="secondary">Edit</Button>
		{#if !data.pendingTransfer}
			<Button href="/dash/sessions/{info.session.id}/transfer" variant="secondary">Transfer</Button>
		{:else}
			<Button variant="secondary" onclick={cancelRequest}>Withdraw transfer request</Button>
		{/if}
		{#if !data.pastSession}
			<Button href="/dash/sessions/{info.session.id}/cancel" variant="danger">Cancel session</Button
			>
		{/if}
	{/if}
</div>
