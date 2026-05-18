import { createFileRoute } from '@tanstack/solid-router';

interface SignalMessage {
	type: 'offer' | 'answer';
	sdp: string;
	target: 'sharer' | 'viewer';
}

let latestOffer: SignalMessage | null = null;
let latestAnswer: SignalMessage | null = null;
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
			// Send any existing signals immediately
			if (latestOffer) {
				controller.enqueue(
					encoder.encode(`${JSON.stringify(latestOffer)}\n`),
				);
			}
			if (latestAnswer) {
				controller.enqueue(
					encoder.encode(`${JSON.stringify(latestAnswer)}\n`),
				);
			}

			controllers.add(controller);

			request.signal.addEventListener('abort', () => {
				controllers.delete(controller);
				try { controller.close(); } catch {}
			});
		},
		cancel() {
			// Controller is cleaned up via abort or iteration error
		},
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		},
	});
};

export const Route = createFileRoute('/demo/screen-share/signal')({
	server: {
		handlers: {
			GET: ({ request }) => handleSSE(request),
			POST: async ({ request }) => {
				const body = (await request.json()) as SignalMessage;
				if (!body.type || !body.sdp || !body.target) {
					return new Response('Invalid signal', { status: 400 });
				}

				if (body.type === 'offer') {
					latestOffer = body;
					latestAnswer = null; // Clear stale answer from previous session
				} else if (body.type === 'answer') {
					latestAnswer = body;
				}

				broadcast(body);
				return Response.json({ ok: true });
			},
		},
	},
});
