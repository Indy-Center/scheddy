<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { DateTime, Interval } from 'luxon';
	import { Alert, Button, Card, Field, PageHeader, Select } from '@indy-center/centerline-svelte';
	import { clientConfig } from '$lib/config/client';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	let done = $state(false);

	const form = superForm(data.form, {
		onUpdated({ form }) {
			if (form.valid) {
				done = true;
			}
		}
	});
	const { form: formData, errors, enhance, delayed, message } = form;

	$effect(() => {
		$formData.timezone = DateTime.local().zoneName;
	});

	const slots = $derived($formData.sessionType ? (data.slotData[$formData.sessionType] ?? []) : []);

	function slotLabel(slot: string): string | null {
		const start = Interval.fromISO(slot).start;
		return start ? start.setZone($formData.timezone).toLocaleString(DateTime.DATETIME_FULL) : null;
	}
</script>

<PageHeader title={data.reschedule ? 'Reschedule a session' : 'Book a session'} class="mb-6">
	Training sessions with {clientConfig.facility.name_public} mentors.
</PageHeader>

<Card class="max-w-2xl">
	{#if data.reschedule && !data.canReschedule}
		<Alert level="caution">
			This session is less than 24 hours away. Please contact your mentor to reschedule it.
		</Alert>
	{:else if data.blocked}
		<Alert level="danger" title="Booking unavailable">
			You can't book new sessions at the moment. Please contact your facility's training staff for
			more information.
		</Alert>
	{:else if done}
		<Alert level="success" title={data.reschedule ? 'Session rescheduled' : 'Session booked'}>
			{$message}
		</Alert>
		<Button href="/my_sessions" variant="secondary" class="mt-4">View my sessions</Button>
	{:else if data.atMaxSessions}
		<Alert level="info" title="Booking limit reached">
			You've booked as many sessions as your facility allows. Contact your training staff if you
			think this is a mistake.
		</Alert>
	{:else}
		<form class="flex flex-col gap-5" method="POST" use:enhance>
			<!-- Step 1: the session type. Fixed when rescheduling. -->
			<div class={data.reschedule ? 'hidden' : ''}>
				<Field label="Session type" error={$errors.sessionType?.[0]} required>
					{#snippet children(control)}
						<Select {...control} name="sessionType" bind:value={$formData.sessionType}>
							<option value="" disabled>
								{data.categories.length
									? 'Choose a session type'
									: 'No session types are available'}
							</option>
							{#each data.categories as category (category.category)}
								<optgroup label={category.category}>
									{#each category.items as item (item.id)}
										<option value={item.id}>{item.name} ({item.length} minutes)</option>
									{/each}
								</optgroup>
							{/each}
						</Select>
					{/snippet}
				</Field>
			</div>

			<!-- Step 2: once there's a type, the time zone and a slot. -->
			{#if $formData.sessionType}
				<Field label="Time zone" error={$errors.timezone?.[0]} required>
					{#snippet children(control)}
						<Select {...control} name="timezone" bind:value={$formData.timezone}>
							{#each data.timezones as timezone (timezone.name)}
								<option value={timezone.name}>{timezone.name}</option>
							{/each}
						</Select>
					{/snippet}
				</Field>

				<Field
					label={data.reschedule ? 'New date and time' : 'Date and time'}
					hint={slots.length ? undefined : 'No mentors are available for this session type yet.'}
					error={$errors.slot?.[0]}
					required
				>
					{#snippet children(control)}
						<Select
							{...control}
							name="slot"
							bind:value={$formData.slot}
							disabled={slots.length === 0}
						>
							<option value="" disabled>Choose a time</option>
							{#each slots as slot (`${slot.slot}@${slot.mentor}`)}
								{@const label = slotLabel(slot.slot)}
								{#if label}
									<option value="{slot.slot}@{slot.mentor}">{label}</option>
								{/if}
							{/each}
						</Select>
					{/snippet}
				</Field>
			{/if}

			<!-- Step 3: submit. -->
			<div class="flex flex-wrap gap-3">
				{#if $formData.slot}
					<Button type="submit" busy={$delayed} busyLabel="Booking">
						{data.reschedule ? 'Reschedule session' : 'Book session'}
					</Button>
				{/if}
				{#if data.reschedule}
					<Button href="/schedule/cancel/{data.oldId}" variant="danger">Cancel session</Button>
				{/if}
			</div>
		</form>
	{/if}
</Card>
