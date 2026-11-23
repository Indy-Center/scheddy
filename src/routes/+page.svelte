<script lang="ts">
	import { Button, Card, Heading, Text } from '@indy-center/centerline-svelte';
	import { clientConfig } from '$lib/config/client';
</script>

<div class="flex flex-1 items-center justify-center">
	<Card class="w-full max-w-lg text-center">
		<Heading level={1}>Scheddy</Heading>
		<Text lead class="mt-2">
			Book training sessions with {clientConfig.facility.name_public} mentors.
		</Text>
		<Button href="/login" size="lg" class="mt-6" data-sveltekit-reload>Sign in with VATSIM</Button>
	</Card>
</div>
