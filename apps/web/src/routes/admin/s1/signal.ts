import { createFileRoute } from '@tanstack/solid-router';

interface SignalMessage {
	type: 'offer' | 'answer' | 'ice-candidate';
	sdp?: string;
	target: 'sharer' | 'viewer';
	candidate?: string;
	sdpMid?: string | null;
	sdpMLineIndex?: number | null;
}

let latestOffer: SignalMessage | null = null;
let latestAnswer: SignalMessage | null = null;
const pendingCandidates: SignalMessage[] = [];
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
			// Replay cached session: offer + candidates for new viewers
			if (latestOffer) {
				controller.enqueue(encoder.encode(`${JSON.stringify(latestOffer)}\n`));
			}
			for (const c of pendingCandidates) {
				controller.enqueue(encoder.encode(`${JSON.stringify(c)}\n`));
			}
			if (latestAnswer) {
				controller.enqueue(encoder.encode(`${JSON.stringify(latestAnswer)}\n`));
			}

			controllers.add(controller);

			request.signal.addEventListener('abort', () => {
				controllers.delete(controller);
				try {
					controller.close();
				} catch {}
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

export const Route = createFileRoute('/admin/s1/signal')({
	server: {
		handlers: {
			GET: ({ request }) => {
				const url = new URL(request.url);
				if (url.searchParams.get('get') === 'offer') {
					return Response.json(latestOffer ?? { type: 'none' });
				}
				return handleSSE(request);
			},
			POST: async ({ request }) => {
				const body = (await request.json()) as SignalMessage;
				if (!body.type || !body.target) {
					return new Response('Invalid signal', { status: 400 });
				}

				if (body.type === 'offer') {
					if (!body.sdp) return new Response('Missing sdp', { status: 400 });
					latestOffer = body;
					latestAnswer = null;
					// pendingCandidates = [];  去掉 pendingCandidates = []。旧 session 的 candidates 不会影响新 session（addIceCandidate 对 ufrag 不匹配的会静默失败）。
				} else if (body.type === 'answer') {
					if (!body.sdp) return new Response('Missing sdp', { status: 400 });
					latestAnswer = body;
				} else if (body.type === 'ice-candidate') {
					if (body.target === 'viewer') {
						pendingCandidates.push(body);
					}
				} else {
					return new Response('Unknown type', { status: 400 });
				}

				broadcast(body);
				return Response.json({ ok: true });
			},
		},
	},
});
