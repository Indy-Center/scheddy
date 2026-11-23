<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import { Alert, Button, Card, PageHeader, toast } from '@indy-center/centerline-svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();

	const form = superForm(data.form, {
		async onUpdated({ form }) {
			if (form.valid) {
				await goto('/dash/types');
				toast('success', 'Session type removed.');
			}
		}
	});
	const { enhance, delayed } = form;
</script>

<PageHeader title="Remove session type">This can't be undone.</PageHeader>

<Card class="max-w-xl">
	<form method="POST" use:enhance class="flex flex-col gap-5">
		<Alert level="danger" title="Are you sure?">
			This permanently removes the session type, and every past and future session booked as it.
		</Alert>
		<div class="flex flex-wrap gap-3">
			<Button type="submit" variant="danger" busy={$delayed} busyLabel="Removing">
				Remove session type
			</Button>
			<Button href="/dash/types" variant="secondary">Keep it</Button>
		</div>
	</form>
</Card>
