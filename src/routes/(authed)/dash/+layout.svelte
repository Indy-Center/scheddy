<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { Breadcrumbs } from '@indy-center/centerline-svelte';

	interface Props {
		children: Snippet;
	}
	let { children }: Props = $props();

	// Pages give `breadcrumbs` as { title, url? }; the last one is this page.
	const crumbs = $derived(
		((page.data.breadcrumbs ?? []) as { title: string; url?: string }[]).map((crumb) => ({
			label: crumb.title,
			href: crumb.url ?? page.url.pathname
		}))
	);
</script>

{#if crumbs.length > 1}
	<Breadcrumbs items={crumbs} class="mb-6" />
{/if}

<div class="flex flex-1 flex-col gap-6">
	{@render children()}
</div>
