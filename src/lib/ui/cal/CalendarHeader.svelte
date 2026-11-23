<script lang="ts">
	import { DateTime } from 'luxon';
	import { Button, Heading, Icon } from '@indy-center/centerline-svelte';
	import { mdiChevronLeft, mdiChevronRight, mdiPlus } from '@mdi/js';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		selectedDay: DateTime;
		selectedWeekStart: DateTime;
		selectedWeekEnd: DateTime;
		view: string;
		onViewChange: (newView: string) => void;
		onSelectedDayChange: (newDay: DateTime) => void;
	}

	let {
		selectedDay,
		selectedWeekStart,
		selectedWeekEnd,
		view,
		onViewChange,
		onSelectedDayChange,
		class: className,
		...restProps
	}: Props = $props();

	const step = $derived(view === 'week' ? { days: 7 } : { days: 1 });
</script>

<div
	class={cn(
		'flex w-full flex-wrap items-center justify-between gap-3 border-b px-4 py-3',
		className
	)}
	{...restProps}
>
	<Heading level={2} look={4}>
		{#if view === 'week'}
			{selectedWeekStart.monthShort}
			{selectedWeekStart.day} – {selectedWeekEnd.monthShort}
			{selectedWeekEnd.day}, {selectedWeekEnd.year}
		{:else}
			{selectedDay.monthLong} {selectedDay.day}, {selectedDay.year}
		{/if}
	</Heading>

	<div class="flex flex-wrap items-center gap-3">
		<div class="flex" role="group" aria-label="View">
			<Button
				variant="secondary"
				size="sm"
				class="rounded-r-none"
				pressed={view === 'day'}
				onclick={() => onViewChange('day')}
			>
				Day
			</Button>
			<Button
				variant="secondary"
				size="sm"
				class="-ml-px rounded-l-none"
				pressed={view === 'week'}
				onclick={() => onViewChange('week')}
			>
				Week
			</Button>
		</div>

		<div class="flex" role="group" aria-label="Move through the calendar">
			<Button
				variant="secondary"
				size="sm"
				class="rounded-r-none"
				aria-label={view === 'week' ? 'Previous week' : 'Previous day'}
				onclick={() => onSelectedDayChange(selectedDay.minus(step))}
			>
				<Icon path={mdiChevronLeft} />
			</Button>
			<Button
				variant="secondary"
				size="sm"
				class="-ml-px rounded-none"
				onclick={() => onSelectedDayChange(DateTime.now())}
			>
				Today
			</Button>
			<Button
				variant="secondary"
				size="sm"
				class="-ml-px rounded-l-none"
				aria-label={view === 'week' ? 'Next week' : 'Next day'}
				onclick={() => onSelectedDayChange(selectedDay.plus(step))}
			>
				<Icon path={mdiChevronRight} />
			</Button>
		</div>

		<Button href="/dash/sessions/create" size="sm">
			<Icon path={mdiPlus} />
			Create session
		</Button>
	</div>
</div>
