<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button, Card, Icon, Switch, Text } from '@indy-center/centerline-svelte';
	import { mdiPlus } from '@mdi/js';
	import TimeRange from './TimeRange.svelte';

	// One day's availability: on or off, then one or more time ranges. Used
	// for each weekday and for each specific-date override. Times are 24-hour
	// and may run past midnight (25:00), so they're number boxes, not time inputs.

	type Time = { hour: number; minute: number };
	type Day = {
		available: boolean;
		start: Time;
		end: Time;
		extraRecords: { start: Time; end: Time }[];
	};

	interface Props {
		label: string;
		day: Day;
		/** superforms' errors for this day, if any. */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		errors?: any;
		/** Extra controls beside the day's switch, such as Remove. */
		actions?: Snippet;
	}
	let { label, day = $bindable(), errors, actions }: Props = $props();

	function addRange() {
		day.extraRecords = [
			...day.extraRecords,
			{ start: { hour: 0, minute: 0 }, end: { hour: 0, minute: 0 } }
		];
	}

	function removeRange(i: number) {
		day.extraRecords = day.extraRecords.filter((_, j) => j !== i);
	}

	function firstError(e: unknown): string | undefined {
		if (!e) return undefined;
		if (Array.isArray(e)) return e[0];
		if (typeof e === 'object') {
			for (const v of Object.values(e as object)) {
				const found = firstError(v);
				if (found) return found;
			}
		}
		return undefined;
	}
	const error = $derived(firstError(errors));
</script>

<Card class="flex flex-col gap-3">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<Switch {label} bind:checked={day.available}>
			{day.available ? 'Available' : 'Not available'}
		</Switch>
		{@render actions?.()}
	</div>

	{#if day.available}
		<TimeRange label="{label}, hours" bind:start={day.start} bind:end={day.end} />
		{#each day.extraRecords as range, i (range)}
			<TimeRange
				label="{label}, more hours {i + 1}"
				bind:start={day.extraRecords[i].start}
				bind:end={day.extraRecords[i].end}
				onremove={() => removeRange(i)}
			/>
		{/each}
		<div>
			<Button variant="secondary" size="sm" onclick={addRange}>
				<Icon path={mdiPlus} />
				Add more hours
			</Button>
		</div>
	{/if}

	{#if error}
		<Text size="small" class="text-destructive">{error}</Text>
	{/if}
</Card>
