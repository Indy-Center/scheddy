<script lang="ts">
	import { DescriptionList, EmptyState, Panel } from '@indy-center/centerline-svelte';
	import type { MentorAvailability } from '$lib/availability';
	import { availabilityText } from '$lib/ui/availabilityText';

	interface Props {
		data: MentorAvailability;
	}
	let { data }: Props = $props();

	const dates = $derived(Object.keys(data.exceptions).sort());
</script>

<Panel title="Specific dates" level={3} class="flex-1">
	{#if dates.length}
		<DescriptionList>
			{#each dates as date (date)}
				<div>
					<dt>{date}</dt>
					<dd class:text-muted-foreground={!data.exceptions[date].available}>
						{availabilityText(data.exceptions[date])}
					</dd>
				</div>
			{/each}
		</DescriptionList>
	{:else}
		<EmptyState size="inline">No dates override the weekly hours.</EmptyState>
	{/if}
</Panel>
