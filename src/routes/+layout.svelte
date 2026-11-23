<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { version } from '$app/environment';
	import { Header, Toaster, setColorScheme } from '@indy-center/centerline-svelte';

	interface Props {
		children: Snippet;
		data: LayoutData;
	}
	let { children, data }: Props = $props();

	setColorScheme({ fallback: 'dark' });
</script>

<svelte:head>
	<title>Indy Center | Training</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<!-- The hub and training site draw their header bar in slate-800 (Centerline's
	     dark card colour) with a blur. Centerline's Header uses the page background,
	     so it's tinted here to match them; drop the class once they move to it. -->
	<Header
		class="bg-card/95! backdrop-blur-lg"
		nav={data.nav}
		current={page.url.pathname}
		member={data.member}
		signInHref="/login"
		signOutHref="/logout"
	/>
	<main id="main" class="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6">
		{@render children()}
	</main>
	<!-- The hub's and training site's footer: the disclaimer and copyright, centred. -->
	<footer data-theme="dark" class="border-t border-border bg-background py-4">
		<div class="mx-auto max-w-6xl px-4 text-center text-xs leading-tight">
			<p class="mb-1 text-muted-foreground">
				This site is not affiliated with the Federal Aviation Administration or any governing
				aviation body. All content contained herein is approved only for use on the VATSIM network.
			</p>
			<p class="text-muted-foreground/80">Copyright {new Date().getFullYear()} Indy Center</p>
			<p class="mt-1">
				<a
					href="https://github.com/ZTL-ARTCC/scheddy"
					target="_blank"
					rel="noopener"
					class="text-muted-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
					>Scheddy v{version}</a
				>
			</p>
		</div>
	</footer>
</div>

<Toaster />
