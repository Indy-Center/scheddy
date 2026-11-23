<script lang="ts">
	import { DropdownMenu, DropdownMenuItem, toast } from '@indy-center/centerline-svelte';

	interface Props {
		id: string | number;
	}
	let { id }: Props = $props();

	async function copyCid() {
		await navigator.clipboard.writeText(String(id));
		toast('success', 'Copied the CID.');
	}
</script>

<div class="flex justify-end">
	<DropdownMenu label="Actions for this mentor" text="Actions">
		<DropdownMenuItem href="/dash/mentors/{id}">View or edit</DropdownMenuItem>
		<DropdownMenuItem onclick={copyCid}>Copy CID</DropdownMenuItem>
	</DropdownMenu>
</div>
