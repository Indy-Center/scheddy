<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { goto } from '$app/navigation';
	import { Button, Card, Field, PageHeader, Select, toast } from '@indy-center/centerline-svelte';
	import UserSelector from '$lib/ui/UserSelector.svelte';
	import { ROLE_DEVELOPER, ROLE_MENTOR, ROLE_STAFF, ROLE_STUDENT, roleString } from '$lib/utils.js';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const form = superForm(data.form, {
		async onUpdated({ form }) {
			if (form.valid) {
				await goto('/dash/users');
				toast('success', 'Role override saved.');
			}
		}
	});
	const { form: formData, errors, enhance, delayed } = form;
</script>

<PageHeader title="Set a role override">
	Give a member more access than their VATUSA role does.
</PageHeader>

<Card class="max-w-xl">
	<form method="POST" use:enhance class="flex flex-col gap-5">
		<UserSelector
			label="Member"
			usersMap={data.usersMap}
			name="id"
			bind:value={$formData.id}
			error={$errors.id?.[0]}
		/>
		<Field
			label="Role"
			hint="Only takes effect if it's higher than their VATUSA role."
			error={$errors.roleOverride?.[0]}
			required
		>
			{#snippet children(control)}
				<Select
					{...control}
					name="roleOverride"
					bind:value={
						() => ($formData.roleOverride ? String($formData.roleOverride) : ''),
						(v) => ($formData.roleOverride = Number(v))
					}
				>
					<option value="" disabled>Choose a role</option>
					{#each [ROLE_STUDENT, ROLE_MENTOR, ROLE_STAFF, ROLE_DEVELOPER] as role (role)}
						<option value={String(role)}>{roleString(role)}</option>
					{/each}
				</Select>
			{/snippet}
		</Field>
		<div>
			<Button type="submit" busy={$delayed} busyLabel="Saving">Save override</Button>
		</div>
	</form>
</Card>
