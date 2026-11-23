<script lang="ts">
	import type { PageData } from './$types';
	import { PageHeader } from '@indy-center/centerline-svelte';
	import TypeForm from '../../TypeForm.svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<PageHeader title="Edit session type">Changes apply to new bookings.</PageHeader>

<TypeForm data={data.form} savedMessage="Session type saved." />
