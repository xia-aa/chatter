import { paraglideVitePlugin } from '@inlang/paraglide-js';
import babel from '@rolldown/plugin-babel';
import { sentryTanstackStart } from '@sentry/tanstackstart-react/vite';
import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig } from 'vite';

const config = defineConfig({
	plugins: [
		devtools(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/paraglide',
			strategy: ['cookie', 'preferredLanguage', 'baseLocale'],
			// cookieName: 'PARAGLIDE_LOCALE',
			routeStrategies: [{ match: '/api/:path(.*)?', exclude: true }],
		}),
		// cloudflare({ viteEnvironment: { name: 'ssr' } }),
		nitro({
			// preset: 'cloudflare-module',
			// cloudflare: {
			// 	wrangler: {
			// 		compatibility_flags: ['nodejs_compat', "nodejs_compat_populate_process_env"],
			// 	},
			// },
			preset: 'vercel',
		}),
		tailwindcss(),
		tanstackStart(),
		sentryTanstackStart({
			org: 'aacode',
			project: 'javascript-tanstackstart-react',
			authToken: process.env.SENTRY_AUTH_TOKEN,
		}),
		react(),
		babel({
			presets: [reactCompilerPreset()],
		}),
	],
	// environments: {
	// 	ssr: { build: { rollupOptions: { input: './src/server.ts' } } },
	// },
	ssr: {
		// noExternal: ['drizzle-orm'],
	},
	// server: {
	// 	port: 4001,
	// },

	// 	test: {
	//   optimizeDeps: {
	//     exclude: ['@opentelemetry/api']
	//   }
	// }
});

export default config;
