<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { goto } from '$app/navigation';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { DateTime } from 'luxon';
	import { Button, Field, PageHeader, Select, toast } from '@indy-center/centerline-svelte';
	import { availSchema } from './availSchema';
	import WeekdayAvailability from './WeekdayAvailability.svelte';
	import SpecificDateAvailability from './SpecificDateAvailability.svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const form = superForm(data.form, {
		validators: zodClient(availSchema),
		dataType: 'json',
		async onUpdated({ form }) {
			if (form.valid) {
				await goto(`/dash/mentors/${data.mentor.id}`);
				toast('success', 'Availability saved.');
			}
		}
	});
	const { form: formData, errors, enhance, delayed } = form;

	const timeIn = (zone: string) =>
		DateTime.local().setZone(zone).toLocaleString(DateTime.TIME_SIMPLE);
	const browserZone = DateTime.local().zone.name;
</script>

<PageHeader title="Availability">
	When {data.mentor.firstName} can be booked for sessions.
</PageHeader>

<form method="POST" use:enhance class="flex flex-col gap-8">
	<Field
		label="Time zone"
		hint="Enter every time on this page in {$formData.timezone}, where it's {timeIn(
			$formData.timezone
		)} now. Your browser thinks you're in {browserZone}, where it's {timeIn(browserZone)}."
		error={$errors.timezone?.[0]}
		required
		class="max-w-xl"
	>
		{#snippet children(control)}
			<Select {...control} name="timezone" bind:value={$formData.timezone}>
				<option value="" disabled>Choose your time zone</option>
				{#each data.timezones as zone (zone.name)}
					<option value={zone.name}>{zone.name} ({zone.alternativeName})</option>
				{/each}
			</Select>
		{/snippet}
	</Field>

	<div class="flex flex-col gap-8 lg:flex-row">
		<WeekdayAvailability {form} />
		<SpecificDateAvailability {form} />
	</div>

	<div>
		<Button type="submit" size="lg" busy={$delayed} busyLabel="Saving">Save availability</Button>
	</div>
</form>
