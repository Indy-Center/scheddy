import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import { colorSchemeHandle } from '@indy-center/centerline-svelte/hooks';
import { serverConfig } from '$lib/config/server';

Sentry.init({
	dsn: serverConfig.metrics.dsn_public

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
});

// If you have custom handlers, make sure to place them after `sentryHandle()` in the `sequence` function.
// colorSchemeHandle serves the member's light/dark choice from the cookie the
// Indy Center sites share, and fills in app.html's colour-scheme script.
// Its resolve type is a MaybePromise where SvelteKit's is a Promise; the two agree at runtime.
export const handle = sequence(
	sentryHandle(),
	colorSchemeHandle({ fallback: 'dark' }) as unknown as Handle
);

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
