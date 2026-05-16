import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/solid-start/plugin/vite';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	plugins: [
		devtools({ removeDevtoolsOnBuild: false }),
		paraglideVitePlugin({
			project: '../../packages/shared/i18n/project.inlang',
			outdir: '../../packages/shared/i18n/paraglide',
			strategy: ['cookie', 'preferredLanguage', 'baseLocale'],
		}),
		tailwindcss(),
		tanstackStart(),
		solidPlugin({ ssr: true }),
		nitro(),
		VitePWA({
			registerType: 'autoUpdate',
			injectRegister: false,
			outDir: '.output/public',
			strategies: 'generateSW',
			workbox: {
				globPatterns: [],
				navigateFallback: null,
				runtimeCaching: [
					{
						urlPattern: /^https?:\/\/.*\/api\/.*/,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24,
							},
						},
					},
				],
				skipWaiting: true,
				clientsClaim: true,
			},
			manifest: false,
			includeAssets: [],
			selfDestroying: false,
		}),
	],
	ssr: {
		noExternal: [
			'solid-sonner',
			'solid-js',
		],
	},
});
