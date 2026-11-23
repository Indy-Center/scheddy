<script lang="ts">
	import { page } from '$app/state';
	import { ErrorPage } from '@indy-center/centerline-svelte';
	import { mdiCalendarPlus, mdiClipboardListOutline } from '@mdi/js';
</script>

<svelte:head>
	<title>Indy Center | Training</title>
</svelte:head>

<ErrorPage
	status={page.status}
	message={page.error?.message}
	path={page.url.pathname}
	links={[
		{ label: 'Book a session', href: '/schedule', icon: mdiCalendarPlus },
		{ label: 'My sessions', href: '/my_sessions', icon: mdiClipboardListOutline }
	]}
/>
