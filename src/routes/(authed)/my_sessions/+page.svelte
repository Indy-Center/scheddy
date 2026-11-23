<script lang="ts">
	import type { PageData } from './$types';
	import { Button, PageHeader } from '@indy-center/centerline-svelte';
	import DataTable from '$lib/ui/DataTable.svelte';
	import { columns } from './columns';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<PageHeader title="My sessions" class="mb-6">
	Your upcoming training sessions as a student.
	{#snippet actions()}
		<Button href="/schedule">Book a session</Button>
	{/snippet}
</PageHeader>

<DataTable
	caption="Your upcoming sessions"
	empty="You have no upcoming sessions."
	data={data.upcomingSessions}
	{columns}
/>
