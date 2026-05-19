import { createFileRoute } from '@tanstack/solid-router';

export interface PubSubMessage {
	type: 'message' | 'ping' | 'offer' | 'answer' | 'ice-candidate' | 'session-end';
	topic?: string;
	text?: string;
	ts?: number;
	target?: 'sharer' | 'viewer';
	sdp?: string;
	candidate?: string;
	sdpMid?: string | null;
	sdpMLineIndex?: number | null;
}

const controllers = new Set<{ controller: ReadableStreamDefaultController; topic: string }>();
const encoder = new TextEncoder();

const SESSION_TTL_MS = 5 * 60 * 1000;
const sessions = new Map<
	string,
	{
		offer: PubSubMessage | null;
		candidates: PubSubMessage[];
		updatedAt: number;
	}
>();

function broadcast(msg: PubSubMessage, topic: string) {
	for (const entry of controllers) {
		if (entry.topic !== topic) continue;
		try {
			entry.controller.enqueue(encoder.encode(`${JSON.stringify(msg)}\n`));
		} catch {
			controllers.delete(entry);
		}
	}
}

function replaySession(topic: string, controller: ReadableStreamDefaultController) {
	const session = sessions.get(topic);
	if (!session) return;
	if (Date.now() - session.updatedAt > SESSION_TTL_MS) {
		sessions.delete(topic);
		return;
	}
	if (session.offer) {
		controller.enqueue(encoder.encode(`${JSON.stringify(session.offer)}\n`));
	}
	for (const c of session.candidates) {
		controller.enqueue(encoder.encode(`${JSON.stringify(c)}\n`));
	}
}

const handleSSE = (request: Request) => {
	const url = new URL(request.url);
	const topic = url.searchParams.get('topic') ?? 'default';
	const stream = new ReadableStream({
		start(controller) {
			replaySession(topic, controller);
			const entry = { controller, topic };
			controllers.add(entry);
			try {
				controller.enqueue(
					encoder.encode(`${JSON.stringify({ type: 'ping' })}\n`),
				);
			} catch {}
			const heartbeat = setInterval(() => {
				try {
					controller.enqueue(
						encoder.encode(`${JSON.stringify({ type: 'ping' })}\n`),
					);
				} catch {}
			}, 2000);

			request.signal.addEventListener('abort', () => {
				controllers.delete(entry);
				clearInterval(heartbeat);
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
			'Cache-Control': 'no-cache, no-transform',
			Connection: 'keep-alive',
			'Keep-Alive': 'timeout=60',
			'X-Accel-Buffering': 'no',
		},
	});
};

export const Route = createFileRoute('/admin/pubsub/api')({
	server: {
		handlers: {
			GET: ({ request }) => handleSSE(request),
			POST: async ({ request }) => {
				const body = (await request.json()) as PubSubMessage;
				const topic = body.topic ?? 'default';
				if (body.type === 'message') {
					broadcast(
						{
							type: 'message',
							topic,
							text: body.text ?? '',
							ts: body.ts ?? Date.now(),
						},
						topic,
					);
					return Response.json({ ok: true });
				}
				if (body.type === 'session-end') {
					sessions.delete(topic);
					broadcast(body, topic);
					return Response.json({ ok: true });
				}
				if (
					body.type !== 'offer' &&
					body.type !== 'answer' &&
					body.type !== 'ice-candidate'
				) {
					return new Response('Invalid message', { status: 400 });
				}

				if (!sessions.has(topic)) {
					sessions.set(topic, { offer: null, candidates: [], updatedAt: 0 });
				}
				const session = sessions.get(topic);
				if (session) {
					session.updatedAt = Date.now();
					if (body.type === 'offer') {
						session.offer = body;
						session.candidates = [];
					} else if (body.type === 'ice-candidate' && body.target === 'viewer') {
						session.candidates.push(body);
					}
				}

				broadcast(body, topic);
				return Response.json({ ok: true });
			},
		},
	},
});
