<script lang="ts">
	import type { PageData } from './$types';
	import { Button, Icon, PageHeader } from '@indy-center/centerline-svelte';
	import { mdiPlus } from '@mdi/js';
	import DataTable from '$lib/ui/DataTable.svelte';
	import { stColumns } from './columns';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<PageHeader title="Session types">
	The kinds of session students can book and mentors can teach.
	{#snippet actions()}
		<Button href="/dash/types/add"><Icon path={mdiPlus} />Add a session type</Button>
	{/snippet}
</PageHeader>

<DataTable
	caption="Session types"
	empty="No session types yet."
	data={data.types}
	columns={stColumns}
/>
