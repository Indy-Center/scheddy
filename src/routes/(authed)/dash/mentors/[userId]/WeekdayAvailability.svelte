<script lang="ts">
	import { DescriptionList, Panel } from '@indy-center/centerline-svelte';
	import type { MentorAvailability } from '$lib/availability';
	import { availabilityText } from '$lib/ui/availabilityText';

	interface Props {
		data: MentorAvailability;
	}
	let { data }: Props = $props();

	const days = [
		['sunday', 'Sunday'],
		['monday', 'Monday'],
		['tuesday', 'Tuesday'],
		['wednesday', 'Wednesday'],
		['thursday', 'Thursday'],
		['friday', 'Friday'],
		['saturday', 'Saturday']
	] as const;
</script>

<Panel title="Every week" level={3} class="flex-1">
	<DescriptionList>
		{#each days as [id, name] (id)}
			<div>
				<dt>{name}</dt>
				<dd class:text-muted-foreground={!data[id].available}>{availabilityText(data[id])}</dd>
			</div>
		{/each}
	</DescriptionList>
</Panel>
