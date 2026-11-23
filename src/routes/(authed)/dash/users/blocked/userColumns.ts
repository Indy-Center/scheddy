import type { ColumnDef } from '@tanstack/table-core';
import { roleString } from '$lib/utils';
import { renderComponent } from '$lib/ui/data-table';
import DataTableActions from './DataTableActions.svelte';

export type TUser = {
	id: number;
	firstName: string;
	lastName: string;
	role: number;
	roleOverride: number;
};

export const userColumns: ColumnDef<TUser>[] = [
	{
		id: 'name',
		header: 'Name',
		cell: ({ row }) => {
			return row.original.firstName + ' ' + row.original.lastName;
		}
	},
	{
		id: 'role',
		header: 'VATUSA Role',
		cell: ({ row }) => {
			return roleString(row.original.role);
		}
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, {
				id: row.original.id
			});
		},
		header: () => ''
	}
];
