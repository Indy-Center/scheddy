<script lang="ts">
	import type { TMentor } from './columns';
	import { Badge } from '@indy-center/centerline-svelte';

	interface Props {
		user: TMentor;
	}
	let { user }: Props = $props();
</script>

<div class="flex flex-wrap items-center gap-2">
	<span>{user.firstName} {user.lastName}</span>
	{#if user.isVisitor}
		<Badge variant="yellow" size="sm">Visitor</Badge>
	{/if}
	{#if !user.isAvailable}
		<Badge variant="red" size="sm">No availability set</Badge>
	{/if}
</div>
