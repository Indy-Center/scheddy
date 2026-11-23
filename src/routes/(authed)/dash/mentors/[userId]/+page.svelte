<script lang="ts">
	import type { PageData } from './$types';
	import {
		Button,
		EmptyState,
		Heading,
		Link,
		PageHeader,
		Panel
	} from '@indy-center/centerline-svelte';
	import DataTable from '$lib/ui/DataTable.svelte';
	import { columns } from './columns';
	import WeekdayAvailability from './WeekdayAvailability.svelte';
	import SpecificDateAvailability from './SpecificDateAvailability.svelte';
	import { ROLE_STAFF } from '$lib/utils';
	import { roleOf } from '$lib';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const isStaff = $derived(roleOf(data.user) >= ROLE_STAFF);
</script>

<PageHeader title="{data.mentor.firstName} {data.mentor.lastName}">
	Time zone: {data.mentor.timezone ?? 'not set'}
	{#snippet actions()}
		<Button href="/dash/sessions/create">Create a session</Button>
	{/snippet}
</PageHeader>

<section class="flex flex-col gap-3">
	<Heading level={2}>Upcoming sessions</Heading>
	<DataTable
		caption="Upcoming sessions"
		empty="No upcoming sessions."
		data={data.mentorSessions}
		{columns}
	/>
</section>

<section class="flex flex-col gap-3">
	<div class="flex flex-wrap items-baseline justify-between gap-2">
		<Heading level={2}>Availability</Heading>
		<Link href="/dash/mentors/{data.mentor.id}/availability">Update availability</Link>
	</div>
	{#if data.mentor.mentorAvailability && data.availability}
		<div class="flex flex-col gap-4 md:flex-row">
			<WeekdayAvailability data={data.availability} />
			<SpecificDateAvailability data={data.availability} />
		</div>
	{:else}
		<EmptyState size="inline">No availability set yet.</EmptyState>
	{/if}
</section>

<div class="grid gap-4 md:grid-cols-2">
	<Panel title="Can teach" level={2}>
		{#if data.allowedTypes?.length}
			<ul class="list-inside list-disc">
				{#each data.allowedTypes as typ (typ)}
					<li>{data.typesMap[typ]}</li>
				{/each}
			</ul>
		{:else}
			<EmptyState size="inline">This mentor can't teach any sessions yet.</EmptyState>
		{/if}
		{#if isStaff}
			<Link
				href="/dash/mentors/{data.mentor.id}/types/allowed_types"
				class="mt-3 inline-block text-sm"
			>
				Update session types they can teach
			</Link>
		{/if}
	</Panel>
	<Panel title="Students can book" level={2}>
		{#if data.bookableTypes?.length}
			<ul class="list-inside list-disc">
				{#each data.bookableTypes as typ (typ)}
					<li>{data.typesMap[typ]}</li>
				{/each}
			</ul>
		{:else}
			<EmptyState size="inline">Students can't book this mentor for any sessions yet.</EmptyState>
		{/if}
		{#if isStaff}
			<Link
				href="/dash/mentors/{data.mentor.id}/types/bookable_types"
				class="mt-3 inline-block text-sm"
			>
				Update session types students can book
			</Link>
		{/if}
	</Panel>
</div>
