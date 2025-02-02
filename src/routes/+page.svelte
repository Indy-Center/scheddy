<script lang="ts">
	import { env } from '$env/dynamic/public';
	import Button from '$lib/ui/Button.svelte';
	import Card from '$lib/ui/Card.svelte';
	import { version } from '$app/environment';
	import { HeartIcon } from 'lucide-svelte';
</script>

<div class="min-w-screen min-h-screen flex flex-col align-middle justify-center items-center">
	<Card>
		<h1 class="font-bold text-2xl text-center">{env.PUBLIC_FACILITY_NAME} - Scheddy</h1>

		<Button
			href="{env.PUBLIC_VATSIM_OAUTH_BASE}/oauth/authorize?response_type=code&client_id={env.PUBLIC_VATSIM_OAUTH_CLIENT_ID}&redirect_uri={env.PUBLIC_VATSIM_OAUTH_REDIRECT_URL}"
		>
			Login with VATSIM
		</Button>

		<a
			target="_blank"
			href="https://github.com/ZTL-ARTCC/scheddy"
			class="block hover:underline text-sm text-slate-500"
			>scheddy v{version} - built with <HeartIcon class="inline w-5 h-5 align-top" /> by the ZTL ARTCC</a
		>
	</Card>
</div>
