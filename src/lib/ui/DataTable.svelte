<script lang="ts" generics="TData, TValue">
	import {
		type ColumnDef,
		getCoreRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type PaginationState,
		type SortingState
	} from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$lib/ui/data-table/index.js';
	import { Button, EmptyState, Table, Th } from '@indy-center/centerline-svelte';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		/** Names the table for screen readers. Hidden from sight unless `showCaption`. */
		caption: string;
		showCaption?: boolean;
		/** What to say when there are no rows. */
		empty?: string;
		class?: string;
	};

	let {
		data,
		columns,
		caption: captionText,
		showCaption = false,
		empty = 'Nothing here yet.',
		class: clazz
		// it does actually exist
		// eslint-disable-next-line no-undef
	}: DataTableProps<TData, TValue> = $props();

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);

	const table = createSvelteTable({
		get data() {
			return data;
		},
		get columns() {
			return columns;
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: (updater) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
		},
		onPaginationChange: (updater) => {
			pagination = typeof updater === 'function' ? updater(pagination) : updater;
		},
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			}
		}
	});

	const pageCount = $derived(table.getPageCount());
</script>

<div class={clazz}>
	<Table hideCaption={!showCaption}>
		{#snippet caption()}{captionText}{/snippet}
		<thead>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<tr>
					{#each headerGroup.headers as header (header.id)}
						<Th scope="col">
							{#if !header.isPlaceholder}
								<FlexRender
									content={header.column.columnDef.header}
									context={header.getContext()}
								/>
							{/if}
						</Th>
					{/each}
				</tr>
			{/each}
		</thead>
		<tbody>
			{#each table.getRowModel().rows as row (row.id)}
				<tr>
					{#each row.getVisibleCells() as cell (cell.id)}
						<td>
							<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
						</td>
					{/each}
				</tr>
			{:else}
				<tr>
					<td colspan={columns.length}>
						<EmptyState size="inline" class="py-6 text-center">{empty}</EmptyState>
					</td>
				</tr>
			{/each}
		</tbody>
	</Table>
	{#if pageCount > 1}
		<div class="flex items-center justify-end gap-3 py-4">
			<span class="text-sm text-muted-foreground">
				Page {pagination.pageIndex + 1} of {pageCount}
			</span>
			<Button
				variant="secondary"
				size="sm"
				onclick={() => table.previousPage()}
				disabled={!table.getCanPreviousPage()}
			>
				Previous
			</Button>
			<Button
				variant="secondary"
				size="sm"
				onclick={() => table.nextPage()}
				disabled={!table.getCanNextPage()}
			>
				Next
			</Button>
		</div>
	{/if}
</div>
