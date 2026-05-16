import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/solid-start/plugin/vite';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

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
	],
	ssr: {
		noExternal: [
			'solid-sonner',
			'solid-js',
			// '@tanstack/solid-devtools',
			// 'solid-js/web',
		],
	},
});
