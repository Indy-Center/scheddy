<script lang="ts">
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import {
		Button,
		Field,
		Icon,
		Input,
		Modal,
		PageHeader,
		toast
	} from '@indy-center/centerline-svelte';
	import { mdiPlus } from '@mdi/js';
	import DataTable from '$lib/ui/DataTable.svelte';
	import { userColumns } from './userColumns';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	let open = $state(false);
	let cid = $state('');
	let busy = $state(false);

	async function add(event: SubmitEvent) {
		event.preventDefault();
		busy = true;
		try {
			const resp = await fetch('?/add', {
				method: 'POST',
				body: new URLSearchParams({ id: cid }).toString(),
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			});
			if (!resp.ok) {
				toast('danger', "We couldn't block that user. Check the CID and try again.");
				return;
			}
			await invalidateAll();
			toast('success', 'User blocked from booking.');
			open = false;
			cid = '';
		} finally {
			busy = false;
		}
	}
</script>

<PageHeader title="Blocked users">
	Members who can't book new sessions.
	{#snippet actions()}
		<Button onclick={() => (open = true)}><Icon path={mdiPlus} />Block a user</Button>
	{/snippet}
</PageHeader>

<DataTable
	caption="Blocked users"
	empty="No one is blocked."
	columns={userColumns}
	data={data.users}
/>

<Modal bind:open title="Block a user" size="sm">
	<form id="block-user" onsubmit={add}>
		<Field label="CID" hint="They won't be able to book new sessions." required>
			{#snippet children(control)}
				<Input {...control} inputmode="numeric" pattern="[0-9]+" bind:value={cid} />
			{/snippet}
		</Field>
	</form>
	{#snippet actions()}
		<Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
		<Button type="submit" form="block-user" {busy} busyLabel="Blocking">Block user</Button>
	{/snippet}
</Modal>
