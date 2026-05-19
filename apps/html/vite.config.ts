import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		proxy: {
			'/parties': {
				target: process.env.PARTYKIT_URL || 'ws://127.0.0.1:1999',
				ws: true,
			},
		},
	},
});
