<script lang="ts">
	import type { PageData } from './$types';
	import { DateTime } from 'luxon';
	import { goto } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import {
		Button,
		Card,
		Checkbox,
		Field,
		Input,
		PageHeader,
		Select,
		toast
	} from '@indy-center/centerline-svelte';
	import { ROLE_STAFF } from '$lib/utils';
	import UserSelector from '$lib/ui/UserSelector.svelte';
	import { roleOf } from '$lib';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const form = superForm(data.form, {
		async onUpdated({ form }) {
			if (form.valid) {
				await goto(`/dash/sessions/${data.sessionInfo.session.id}`);
				toast('success', 'Session saved.');
			}
		}
	});
	const { form: formData, errors, enhance, delayed } = form;

	const zone = $derived(data.sessionInfo.session.timezone);
	const nowThere = $derived(DateTime.now().setZone(zone).toLocaleString(DateTime.TIME_SIMPLE));

	const pad = (n: number | string) => String(n).padStart(2, '0');
</script>

<PageHeader title="Edit session">
	{data.sessionInfo.student.firstName}
	{data.sessionInfo.student.lastName}'s {data.sessionInfo.sessionType.name}
</PageHeader>

<Card class="max-w-xl">
	<form method="POST" use:enhance class="flex flex-col gap-5">
		<div class="grid gap-5 sm:grid-cols-2">
			<Field label="Date" error={$errors.date?.[0]} required>
				{#snippet children(control)}
					<Input {...control} type="date" name="date" bind:value={$formData.date} />
				{/snippet}
			</Field>
			<Field
				label="Time"
				hint="In {zone}, where it's {nowThere} now."
				error={$errors.hour?.[0] ?? $errors.minute?.[0]}
				required
			>
				{#snippet children(control)}
					<Input
						{...control}
						type="time"
						bind:value={
							() => `${pad($formData.hour)}:${pad($formData.minute)}`,
							(v) => {
								const [h, m] = String(v).split(':');
								$formData.hour = Number(h);
								$formData.minute = Number(m);
							}
						}
					/>
				{/snippet}
			</Field>
		</div>
		<input type="hidden" name="hour" value={$formData.hour} />
		<input type="hidden" name="minute" value={$formData.minute} />

		<Field label="Session type" error={$errors.type?.[0]} required>
			{#snippet children(control)}
				<Select {...control} name="type" bind:value={$formData.type}>
					{#each Object.entries(data.typesMap) as [id, type] (id)}
						<option value={id}>{type.name} ({type.length} minutes)</option>
					{/each}
				</Select>
			{/snippet}
		</Field>

		{#if roleOf(data.user) >= ROLE_STAFF}
			<UserSelector
				label="Mentor"
				usersMap={data.usersMap}
				name="mentor"
				bind:value={$formData.mentor}
				error={$errors.mentor?.[0]}
			/>
		{/if}

		<Checkbox
			label="Keep the old time closed"
			name="addException"
			bind:checked={$formData.addException}
		>
			Takes the session's current time out of the mentor's availability, so students can't book it
			once the session moves.
		</Checkbox>

		<div>
			<Button type="submit" busy={$delayed} busyLabel="Saving">Save</Button>
		</div>
	</form>
</Card>
