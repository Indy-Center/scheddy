<script lang="ts">
	import type { Infer, SuperForm } from 'sveltekit-superforms';
	import { DateTime } from 'luxon';
	import { Button, EmptyState, Field, Heading, Input, Text } from '@indy-center/centerline-svelte';
	import type { AvailSchema } from './availSchema';
	import DayEditor from './DayEditor.svelte';

	interface Props {
		form: SuperForm<Infer<AvailSchema>>;
	}
	let { form }: Props = $props();
	const { form: formData, errors } = form;

	const today = DateTime.local().toISODate();
	let dateToAdd = $state('');

	const dates = $derived(Object.keys($formData.exceptions).sort());

	function addException() {
		if (dateToAdd && !(dateToAdd in $formData.exceptions)) {
			$formData.exceptions[dateToAdd] = {
				available: false,
				start: { hour: 0, minute: 0 },
				end: { hour: 0, minute: 0 },
				extraRecords: []
			};
		}
		dateToAdd = '';
	}

	function removeException(date: string) {
		delete $formData.exceptions[date];
		$formData.exceptions = $formData.exceptions;
	}

	function copyWeekday(date: string) {
		const weekday = DateTime.fromISO(date).toFormat('cccc').toLowerCase() as keyof typeof $formData;
		$formData.exceptions[date] = structuredClone($formData[weekday]) as never;
	}

	function dateLabel(date: string): string {
		return DateTime.fromISO(date).toLocaleString(DateTime.DATE_HUGE);
	}
</script>

<section class="flex flex-1 flex-col gap-3">
	<Heading level={2}>Specific dates</Heading>
	<Text size="small">Dates that don't follow your weekly hours, such as a holiday.</Text>

	<div class="flex flex-wrap items-end gap-3">
		<Field label="Date" class="flex-1">
			{#snippet children(control)}
				<Input {...control} type="date" min={today} bind:value={dateToAdd} />
			{/snippet}
		</Field>
		<Button variant="secondary" onclick={addException} disabled={!dateToAdd}>Add date</Button>
	</div>

	{#each dates as date (date)}
		<DayEditor
			label={dateLabel(date)}
			bind:day={$formData.exceptions[date]}
			errors={$errors.exceptions?.[date]}
		>
			{#snippet actions()}
				<div class="flex gap-2">
					<Button variant="secondary" size="sm" onclick={() => copyWeekday(date)}>
						Copy weekly hours
					</Button>
					<Button variant="danger" size="sm" onclick={() => removeException(date)}>Remove</Button>
				</div>
			{/snippet}
		</DayEditor>
	{:else}
		<EmptyState size="inline">No dates override your weekly hours.</EmptyState>
	{/each}
</section>
