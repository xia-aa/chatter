import { createFileRoute } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';
import {
	prepareElectricUrl,
	proxyElectricRequest,
} from '#/integrations/electric/proxy.ts';
import { reqAuthMiddle } from '#/lib/middleware/req.ts';

export const Route = createFileRoute('/api/friend_request')({
	server: {
		middleware: [reqAuthMiddle],
		handlers: {
			GET: async ({ request, context: { user } }) => {
				const originUrl = prepareElectricUrl(request.url);

				originUrl.searchParams.set('table', 'friend_request');
				const filter = `emitter_id = '${user.id}' OR (receiver_id = '${user.id}' AND status = 'pending')`;
				originUrl.searchParams.set('where', filter);

				return proxyElectricRequest(originUrl);
			},
		},
	},
});
