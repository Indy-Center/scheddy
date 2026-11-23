<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { goto } from '$app/navigation';
	import { Button, Card, PageHeader, toast } from '@indy-center/centerline-svelte';
	import UserSelector from '$lib/ui/UserSelector.svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const form = superForm(data.form, {
		async onUpdated({ form }) {
			if (form.valid) {
				await goto('/dash/users');
				toast('success', "The member's role is up to date.");
			}
		}
	});
	const { form: formData, errors, enhance, delayed } = form;
</script>

<PageHeader title="Resync a user">Fetch a member's role from VATUSA again.</PageHeader>

<Card class="max-w-xl">
	<form method="POST" use:enhance class="flex flex-col gap-5">
		<UserSelector
			label="Member"
			usersMap={data.usersMap}
			name="id"
			bind:value={$formData.id}
			error={$errors.id?.[0]}
		/>
		<div>
			<Button type="submit" busy={$delayed} busyLabel="Syncing">Resync</Button>
		</div>
	</form>
</Card>
