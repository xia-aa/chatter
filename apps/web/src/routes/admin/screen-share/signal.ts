import { createFileRoute } from '@tanstack/solid-router';

interface SignalMessage {
	type: 'signal';
	target: 'sharer' | 'viewer';
	data: any;
}

let pendingViewerSignal: any = null;
let pendingSharerSignal: any = null;
const controllers = new Set<ReadableStreamDefaultController>();
const encoder = new TextEncoder();

function broadcast(msg: SignalMessage) {
	for (const c of controllers) {
		try {
			c.enqueue(encoder.encode(`${JSON.stringify(msg)}\n`));
		} catch {
			controllers.delete(c);
		}
	}
}

const handleSSE = (request: Request) => {
	const stream = new ReadableStream({
		start(controller) {
			if (pendingViewerSignal) {
				controller.enqueue(
					encoder.encode(
						`${JSON.stringify({ type: 'signal', target: 'viewer', data: pendingViewerSignal })}\n`,
					),
				);
			}
			if (pendingSharerSignal) {
				controller.enqueue(
					encoder.encode(
						`${JSON.stringify({ type: 'signal', target: 'sharer', data: pendingSharerSignal })}\n`,
					),
				);
			}

			controllers.add(controller);

			request.signal.addEventListener('abort', () => {
				controllers.delete(controller);
				try { controller.close(); } catch {}
			});
		},
		cancel() {},
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		},
	});
};

export const Route = createFileRoute('/admin/screen-share/signal')({
	server: {
		handlers: {
			GET: ({ request }) => handleSSE(request),
			POST: async ({ request }) => {
				const body = (await request.json()) as SignalMessage;
				if (body.type !== 'signal' || !body.target) {
					return new Response('Invalid signal', { status: 400 });
				}

				if (body.target === 'viewer') {
					pendingViewerSignal = body.data;
				} else if (body.target === 'sharer') {
					pendingSharerSignal = body.data;
				}

				broadcast(body);
				return Response.json({ ok: true });
			},
		},
	},
});
