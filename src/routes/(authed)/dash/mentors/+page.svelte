<script lang="ts">
	import type { PageData } from './$types';
	import { Link, PageHeader } from '@indy-center/centerline-svelte';
	import DataTable from '$lib/ui/DataTable.svelte';
	import { mentorsCols } from './columns';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<PageHeader title="Mentors">
	Mentors and instructors are added automatically from their VATUSA role.
</PageHeader>

<p>To add someone else, <Link href="/dash/users/set">give them a role override</Link>.</p>

<DataTable caption="Mentors" empty="No mentors yet." data={data.users} columns={mentorsCols} />
