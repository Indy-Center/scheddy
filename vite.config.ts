import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: 'ztl-artcc',
				project: 'scheddy'
			}
		}),
		sveltekit(),
		tailwindcss()
	],
	optimizeDeps: {
		// scripts/patch-centerline.js edits this package after install. Serving it
		// unbundled means browsers always get the patched files, instead of a
		// pre-bundled copy cached under an unchanged version hash.
		exclude: ['@indy-center/centerline-svelte']
	}
});
