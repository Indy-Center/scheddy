<script lang="ts">
	import type { PageData } from './$types';
	import { PageHeader } from '@indy-center/centerline-svelte';
	import TypeForm from '../TypeForm.svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<PageHeader title="Add a session type"
	>A kind of session students can book or mentors can create.</PageHeader
>

<TypeForm data={data.form} savedMessage="Session type added." />
