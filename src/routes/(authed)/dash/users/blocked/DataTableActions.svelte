<script lang="ts">
	import {
		DropdownMenu,
		DropdownMenuItem,
		confirmAction,
		toast
	} from '@indy-center/centerline-svelte';
	import { invalidateAll } from '$app/navigation';

	interface Props {
		id: string | number;
	}
	let { id }: Props = $props();

	async function copyCid() {
		await navigator.clipboard.writeText(String(id));
		toast('success', 'Copied the CID.');
	}

	async function unblock() {
		const sure = await confirmAction({
			title: 'Unblock this user?',
			message: 'They will be able to book sessions again.',
			confirmLabel: 'Unblock'
		});
		if (!sure) return;
		const resp = await fetch('?/remove', {
			method: 'POST',
			body: new URLSearchParams({ id: String(id) }).toString(),
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		});
		if (!resp.ok) {
			toast('danger', "We couldn't unblock that user. Try again.");
			return;
		}
		await invalidateAll();
		toast('success', 'User unblocked.');
	}
</script>

<div class="flex justify-end">
	<DropdownMenu label="Actions for this user" text="Actions">
		<DropdownMenuItem onclick={unblock}>Unblock</DropdownMenuItem>
		<DropdownMenuItem onclick={copyCid}>Copy CID</DropdownMenuItem>
	</DropdownMenu>
</div>
