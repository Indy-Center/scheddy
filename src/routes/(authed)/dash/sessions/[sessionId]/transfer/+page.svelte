<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import { Button, Card, PageHeader, toast } from '@indy-center/centerline-svelte';
	import UserSelector from '$lib/ui/UserSelector.svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const form = superForm(data.form, {
		async onUpdated({ form }) {
			if (form.valid) {
				await goto(`/dash/sessions/${data.sessionId}`);
				toast('success', 'Transfer request sent.');
			}
		}
	});
	const { form: formData, errors, enhance, delayed } = form;
</script>

<PageHeader title="Transfer session">Ask another mentor to take this session.</PageHeader>

<Card class="max-w-xl">
	<form method="POST" use:enhance class="flex flex-col gap-5">
		<UserSelector
			label="Mentor"
			hint="They'll be asked to accept it."
			usersMap={data.usersMap}
			name="newMentor"
			bind:value={$formData.newMentor}
			error={$errors.newMentor?.[0]}
		/>
		<div>
			<Button
				type="submit"
				disabled={!Number($formData.newMentor)}
				busy={$delayed}
				busyLabel="Sending"
			>
				Send transfer request
			</Button>
		</div>
	</form>
</Card>
