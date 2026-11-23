<script lang="ts">
	import { Icon } from '@indy-center/centerline-svelte';
	import { mdiArrowDown, mdiArrowUp, mdiSwapVertical } from '@mdi/js';

	// A table column header that sorts its column. Rendered from columns.ts
	// with renderComponent(SortButton, { label, isSorted, onclick }).
	interface Props {
		label: string;
		isSorted: false | 'asc' | 'desc';
		onclick: () => void;
	}
	let { label, isSorted, onclick }: Props = $props();

	const icon = $derived(
		isSorted === 'asc' ? mdiArrowUp : isSorted === 'desc' ? mdiArrowDown : mdiSwapVertical
	);
	const state = $derived(
		isSorted === 'asc'
			? 'sorted ascending'
			: isSorted === 'desc'
				? 'sorted descending'
				: 'not sorted'
	);
</script>

<button
	type="button"
	{onclick}
	class="-mx-1 inline-flex items-center gap-1 rounded px-1 font-semibold hover:text-link focus-visible:outline-2 focus-visible:outline-ring"
>
	{label}
	<Icon path={icon} />
	<span class="sr-only">({state}, select to change)</span>
</button>
