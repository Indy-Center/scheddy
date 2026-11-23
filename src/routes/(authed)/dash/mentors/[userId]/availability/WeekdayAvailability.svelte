<script lang="ts">
	import type { Infer, SuperForm } from 'sveltekit-superforms';
	import { Heading, Text } from '@indy-center/centerline-svelte';
	import type { AvailSchema } from './availSchema';
	import DayEditor from './DayEditor.svelte';

	interface Props {
		form: SuperForm<Infer<AvailSchema>>;
	}
	let { form }: Props = $props();
	const { form: formData, errors } = form;

	const days = [
		['sunday', 'Sunday'],
		['monday', 'Monday'],
		['tuesday', 'Tuesday'],
		['wednesday', 'Wednesday'],
		['thursday', 'Thursday'],
		['friday', 'Friday'],
		['saturday', 'Saturday']
	] as const;
</script>

<section class="flex flex-1 flex-col gap-3">
	<Heading level={2}>Every week</Heading>
	<Text size="small">The hours you're available each week. Days switched off are unavailable.</Text>
	{#each days as [id, name] (id)}
		<DayEditor label={name} bind:day={$formData[id]} errors={$errors[id]} />
	{/each}
</section>
