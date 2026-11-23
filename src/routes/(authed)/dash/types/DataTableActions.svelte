<script lang="ts">
	import { DropdownMenu, DropdownMenuItem, toast } from '@indy-center/centerline-svelte';

	interface Props {
		id: string;
	}
	let { id }: Props = $props();

	async function copyId() {
		await navigator.clipboard.writeText(id);
		toast('success', 'Copied the session type ID.');
	}
</script>

<div class="flex justify-end">
	<DropdownMenu label="Actions for this session type" text="Actions">
		<DropdownMenuItem href="/dash/types/edit/{id}">Edit</DropdownMenuItem>
		<DropdownMenuItem href="/dash/types/delete/{id}">Remove</DropdownMenuItem>
		<DropdownMenuItem onclick={copyId}>Copy ID</DropdownMenuItem>
	</DropdownMenu>
</div>
