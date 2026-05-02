import { createFileRoute } from '@tanstack/react-router';
import {
	prepareElectricUrl,
	proxyElectricRequest,
} from '#/integrations/electric/proxy.ts';
import { reqAuthMiddle } from '#/lib/middleware/req.ts';

export const Route = createFileRoute('/api/todo')({
	server: {
		middleware: [reqAuthMiddle],
		handlers: {
			GET: async ({ request, context }) => {
				const originUrl = prepareElectricUrl(request.url);
				// set shape parameters
				// full spec: https://github.com/electric-sql/electric/blob/main/website/electric-api.yaml
				originUrl.searchParams.set('table', 'todo');
				// Where clause to filter rows in the table (optional).
				const filter = `user_id = '${context.user.id}'`;
				originUrl.searchParams.set('where', filter);
				// Select the columns to sync (optional)
				// originUrl.searchParams.set("columns", "id,text,completed")

				return proxyElectricRequest(originUrl);
			},
		},
	},
});
