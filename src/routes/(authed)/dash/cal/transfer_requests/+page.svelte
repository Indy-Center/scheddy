<script lang="ts">
	import type { PageData } from './$types';
	import { PageHeader } from '@indy-center/centerline-svelte';
	import { columns } from './columns';
	import DataTable from '$lib/ui/DataTable.svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<PageHeader title="Transfer requests"
	>Sessions a mentor has asked to hand to another mentor.</PageHeader
>

<DataTable
	caption="Pending transfer requests"
	empty="There are no pending transfer requests."
	data={data.pendingSessionTransfers}
	{columns}
/>
