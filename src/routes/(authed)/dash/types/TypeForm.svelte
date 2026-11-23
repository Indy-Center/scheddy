<script lang="ts">
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import { goto } from '$app/navigation';
	import {
		Button,
		Card,
		Checkbox,
		Field,
		Input,
		Select,
		toast
	} from '@indy-center/centerline-svelte';
	import { ratingIdDisplay, RATINGS } from '$lib/utils';
	import type { typeSchema } from './typeSchema';

	// The add and edit forms for a session type.
	interface Props {
		data: SuperValidated<Infer<typeof typeSchema>>;
		savedMessage: string;
	}
	let { data, savedMessage }: Props = $props();

	const form = superForm(data, {
		async onUpdated({ form }) {
			if (form.valid) {
				await goto('/dash/types');
				toast('success', savedMessage);
			}
		}
	});
	const { form: formData, errors, enhance, delayed } = form;
</script>

<Card class="max-w-2xl">
	<form method="POST" use:enhance class="flex flex-col gap-5">
		<Field label="Name" error={$errors.name?.[0]} required>
			{#snippet children(control)}
				<Input {...control} name="name" bind:value={$formData.name} />
			{/snippet}
		</Field>
		<Field
			label="Category"
			hint="Types are grouped by category when booking."
			error={$errors.category?.[0]}
			required
		>
			{#snippet children(control)}
				<Input {...control} name="category" bind:value={$formData.category} />
			{/snippet}
		</Field>
		<div class="grid gap-5 sm:grid-cols-2">
			<Field label="Length" hint="In minutes." error={$errors.length?.[0]} required>
				{#snippet children(control)}
					<Input {...control} name="length" type="number" min="1" bind:value={$formData.length} />
				{/snippet}
			</Field>
			<Field label="Order" hint="Lowest is listed first." error={$errors.order?.[0]} required>
				{#snippet children(control)}
					<Input {...control} name="order" type="number" bind:value={$formData.order} />
				{/snippet}
			</Field>
		</div>
		<Field
			label="Required rating"
			hint="Only members with this rating or higher can book it."
			error={$errors.rating?.[0]}
			required
		>
			{#snippet children(control)}
				<Select
					{...control}
					name="rating"
					bind:value={() => String($formData.rating ?? ''), (v) => ($formData.rating = Number(v))}
				>
					<option value="" disabled>Choose a rating</option>
					{#each RATINGS as rating (rating.id)}
						<option value={String(rating.id)}>{ratingIdDisplay(rating.id)}</option>
					{/each}
				</Select>
			{/snippet}
		</Field>
		<Checkbox
			label="Students can book it"
			name="bookable"
			bind:checked={$formData.bookable}
			error={$errors.bookable?.[0]}
		>
			Off to keep it for mentors to create sessions with.
		</Checkbox>
		<div>
			<Button type="submit" busy={$delayed} busyLabel="Saving">Save</Button>
		</div>
	</form>
</Card>
