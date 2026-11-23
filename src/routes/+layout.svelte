<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import {
		Footer,
		Header,
		INDY_CENTER_APPS,
		Toaster,
		setColorScheme
	} from '@indy-center/centerline-svelte';

	interface Props {
		children: Snippet;
		data: LayoutData;
	}
	let { children, data }: Props = $props();

	setColorScheme({ fallback: 'dark' });

	// Scheddy is part of Training as far as members are concerned: the header
	// names Training beside the logo and the Apps menu marks it as current.
	const app = INDY_CENTER_APPS.find((a) => a.label === 'Training');

	// Centerline's page titles: "<Page> | <App> | Indy Center", and the app's
	// home is "<App> | Indy Center". A page names itself with `title` in its
	// data, or with its last breadcrumb.
	const pageTitle = $derived(page.data.title ?? page.data.breadcrumbs?.at(-1)?.title);

	// Centerline's footer: a few short columns of pages that exist, each link
	// named for its page. Privacy and accessibility join once those pages exist.
	const footer = [
		{
			heading: 'Apps',
			links: [
				{ href: 'https://flyindycenter.com', label: 'Community' },
				{ href: 'https://training.flyindycenter.com', label: 'Training' },
				{ href: 'https://library.flyindycenter.com', label: 'Library' },
				{ href: 'https://charts.flyindycenter.com', label: 'Charts' }
			]
		},
		{
			heading: 'Help',
			links: [
				{ href: 'https://flyindycenter.com/contact', label: 'Contact Us' },
				{ href: 'https://flyindycenter.com/feedback', label: 'Submit Feedback' },
				{ href: 'https://discord.indy.center', label: 'Discord' }
			]
		}
	];
</script>

<svelte:head>
	<title>{pageTitle ? `${pageTitle} | Training | Indy Center` : 'Training | Indy Center'}</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Header
		{app}
		nav={data.nav}
		current={page.url.pathname}
		member={data.member}
		signInHref="/login"
		signOutHref="/logout"
	/>
	<main id="main" class="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6">
		{@render children()}
	</main>
	<Footer columns={footer} />
</div>

<Toaster />
