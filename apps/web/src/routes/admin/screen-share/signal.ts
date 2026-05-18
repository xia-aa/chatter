import { createFileRoute } from '@tanstack/solid-router';

interface OfferMessage {
	type: 'offer';
	target: 'sharer' | 'viewer';
	sdp: string;
}

interface AnswerMessage {
	type: 'answer';
	target: 'sharer' | 'viewer';
	sdp: string;
}

interface IceCandidateMessage {
	type: 'ice-candidate';
	target: 'sharer' | 'viewer';
	candidate: string;
	sdpMid: string | null;
	sdpMLineIndex: number | null;
}

type SignalMessage = OfferMessage | AnswerMessage | IceCandidateMessage;

const pending: { viewer: SignalMessage[]; sharer: SignalMessage[] } = {
	viewer: [],
	sharer: [],
};
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

function flushPending(
	controller: ReadableStreamDefaultController,
	target: 'viewer' | 'sharer',
) {
	for (const msg of pending[target]) {
		controller.enqueue(encoder.encode(`${JSON.stringify(msg)}\n`));
	}
	// pending[target] = [];
}

const handleSSE = (request: Request) => {
	const stream = new ReadableStream({
		start(controller) {
			flushPending(controller, 'viewer');
			flushPending(controller, 'sharer');

			controllers.add(controller);

			request.signal.addEventListener('abort', () => {
				controllers.delete(controller);
				try {
					controller.close();
				} catch {}
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
				if (
					!body.type ||
					!body.target ||
					(body.type !== 'offer' &&
						body.type !== 'answer' &&
						body.type !== 'ice-candidate')
				) {
					return new Response('Invalid signal', { status: 400 });
				}

				pending[body.target].push(body);
				broadcast(body);
				return Response.json({ ok: true });
			},
		},
	},
});
