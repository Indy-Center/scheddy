<script lang="ts">
	import type { PageData } from './$types';
	import { Button, Icon, PageHeader } from '@indy-center/centerline-svelte';
	import { mdiPlus } from '@mdi/js';
	import DataTable from '$lib/ui/DataTable.svelte';
	import { userColumns } from './userColumns';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<PageHeader title="Users">
	Members with a role override. ATMs, DATMs, WMs and TAs get access from their VATUSA role, so they
	aren't listed.
	{#snippet actions()}
		<Button href="/dash/users/set"><Icon path={mdiPlus} />Set an override</Button>
	{/snippet}
</PageHeader>

<DataTable
	caption="Users with a role override"
	empty="No one has a role override."
	columns={userColumns}
	data={data.users}
/>
