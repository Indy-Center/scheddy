<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { goto } from '$app/navigation';
	import {
		Button,
		Card,
		EmptyState,
		Fieldset,
		PageHeader,
		Switch,
		toast
	} from '@indy-center/centerline-svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const form = superForm(data.form, {
		dataType: 'json',
		async onUpdated({ form }) {
			if (form.valid) {
				await goto(`/dash/mentors/${data.mentor.id}`);
				toast('success', 'Bookable session types saved.');
			}
		}
	});
	const { form: formData, delayed, enhance } = form;

	const types = $derived(Object.entries(data.typesMap));
</script>

<PageHeader title="What students can book with {data.mentor.firstName}">
	Of the types {data.mentor.firstName}
	{data.mentor.lastName} can teach, the ones students can book themselves.
</PageHeader>

<Card class="max-w-xl">
	{#if types.length}
		<form method="POST" use:enhance class="flex flex-col gap-5">
			<Fieldset legend="Bookable session types">
				{#each types as [id, name] (id)}
					<Switch label={name} bind:checked={$formData.allowed[id]} />
				{/each}
			</Fieldset>
			<div>
				<Button type="submit" busy={$delayed} busyLabel="Saving">Save</Button>
			</div>
		</form>
	{:else}
		<EmptyState size="inline"
			>{data.mentor.firstName} can't teach any session types yet, so there's nothing for students to book.</EmptyState
		>
	{/if}
</Card>
