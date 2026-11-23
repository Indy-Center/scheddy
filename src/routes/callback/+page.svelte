<script lang="ts">
	import type { PageData } from './$types';
	import { Alert, Button, Card, Spinner, Text } from '@indy-center/centerline-svelte';

	interface Props {
		data: PageData;
	}
	let { data }: Props = $props();
</script>

<div class="flex flex-1 items-center justify-center">
	<Card class="w-full max-w-lg">
		{#if data.success}
			<div class="flex items-center gap-3">
				<Spinner label="Signing you in" />
				<Text>Signed in. Taking you to Scheddy…</Text>
			</div>
		{:else}
			<Alert level="danger" title="We couldn't sign you in">
				{data.error_message} (error code: {data.error_code})
			</Alert>
			<Button href="/login" class="mt-4" data-sveltekit-reload>Try again</Button>
		{/if}
	</Card>
</div>
