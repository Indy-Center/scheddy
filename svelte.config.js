import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		paths: {
			// Build-time. Set BASE_PATH (e.g. /scheddy) to serve under a path prefix.
			base: process.env.BASE_PATH ?? ''
		},
		version: {
			name: process.env.npm_package_version
		}
	}
};

export default config;
