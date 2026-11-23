<script lang="ts">
	import { DropdownMenu, DropdownMenuItem, toast } from '@indy-center/centerline-svelte';

	interface Props {
		id: string | number;
		roleOverride: number;
	}
	let { id, roleOverride }: Props = $props();

	async function copyCid() {
		await navigator.clipboard.writeText(String(id));
		toast('success', 'Copied the CID.');
	}
</script>

<div class="flex justify-end">
	<DropdownMenu label="Actions for this user" text="Actions">
		<DropdownMenuItem href="/dash/users/set?id={id}&roleOverride={roleOverride}"
			>Edit</DropdownMenuItem
		>
		<DropdownMenuItem onclick={copyCid}>Copy CID</DropdownMenuItem>
	</DropdownMenu>
</div>
