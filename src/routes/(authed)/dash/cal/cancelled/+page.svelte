<script lang="ts">
	import type { PageData } from './$types';
	import { PageHeader } from '@indy-center/centerline-svelte';
	import { columns } from '../columns';
	import DataTable from '$lib/ui/DataTable.svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<PageHeader title="Cancelled sessions"
	>Sessions that were cancelled by the student or a mentor.</PageHeader
>

<DataTable
	caption="Cancelled sessions"
	empty="No sessions have been cancelled."
	data={data.mentorSessions}
	{columns}
/>
