import { Button } from '@repo/ui/base/button';
import { createEffect, createSignal, onCleanup, Show } from 'solid-js';

const API_PATH = '/demo/screen-share/signal';
const ICE_SERVERS = {
	iceServers: [
		{ urls: 'stun:stun.l.google.com:19302' },
		{ urls: 'stun:stun1.l.google.com:19302' },
	],
};

export default function ScreenShare() {
	const [mode, setMode] = createSignal<'idle' | 'sharing' | 'watching'>('idle');
	const [localStream, setLocalStream] = createSignal<MediaStream | null>(null);
	const [remoteStream, setRemoteStream] = createSignal<MediaStream | null>(
		null,
	);
	const [status, setStatus] = createSignal(
		'Open this page in two tabs — share in one, watch in the other',
	);

	let pc: RTCPeerConnection | undefined;
	let localVideo: HTMLVideoElement | undefined;
	let remoteVideo: HTMLVideoElement | undefined;
	let sseReader: ReadableStreamDefaultReader | undefined;
	let sseCancelled = false;
	let offerSent = false;

	// SSR guard
	if (typeof window === 'undefined') return null;

	// Connect SSE on mount — both tabs listen for signals
	createEffect(() => {
		let cancelled = false;
		sseCancelled = false;

		const connectSSE = async () => {
			try {
				const response = await fetch(API_PATH);
				const reader = response.body?.getReader();
				if (!reader || cancelled) return;
				sseReader = reader;
				const decoder = new TextDecoder();
				while (!cancelled && !sseCancelled) {
					const { done, value } = await reader.read();
					if (done) break;
					for (const line of decoder
						.decode(value, { stream: true })
						.split('\n')
						.filter(Boolean)) {
						if (cancelled || sseCancelled) break;
						const msg = JSON.parse(line);
						const m = mode();
						if (m === 'sharing' && msg.type === 'answer' && offerSent) {
							try {
								await pc?.setRemoteDescription(
									new RTCSessionDescription({ type: 'answer', sdp: msg.sdp }),
								);
								setStatus('Connected! Screen is being viewed');
							} catch {
								// Stale answer from previous session — ignore
							}
						} else if (m === 'idle' && msg.type === 'offer' && !pc) {
							setStatus('Incoming screen share detected, connecting...');
							startWatching(msg.sdp);
						}
					}
				}
			} catch (err) {
				if (!cancelled) console.error('SSE error:', err);
			}
		};

		connectSSE();

		onCleanup(() => {
			cancelled = true;
			sseCancelled = true;
			sseReader?.cancel();
		});
	});

	function cleanup() {
		sseCancelled = true;
		sseReader?.cancel();
		sseReader = undefined;
		localStream()
			?.getTracks()
			.forEach((t) => {
				t.stop();
			});
		pc?.close();
		pc = undefined;
		offerSent = false;
		setLocalStream(null);
		setRemoteStream(null);
		setMode('idle');
		setStatus('Open this page in two tabs — share in one, watch in the other');
	}

	async function startBroadcasting() {
		try {
			setStatus('Requesting screen capture...');
			const stream = await navigator.mediaDevices.getDisplayMedia({
				video: true,
			});
			setLocalStream(stream);
			stream.getVideoTracks()[0].addEventListener('ended', cleanup);

			setStatus('Creating peer connection...');
			pc = new RTCPeerConnection(ICE_SERVERS);
			stream.getTracks().forEach((track) => {
				pc!.addTrack(track, stream);
			});
			pc.ontrack = (event) => {
				setRemoteStream(event.streams[0]);
			};

			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);

			if (pc.iceGatheringState !== 'complete') {
				await new Promise<void>((resolve) => {
					pc!.addEventListener('icegatheringstatechange', () => {
						if (pc!.iceGatheringState === 'complete') resolve();
					});
				});
			}

			setMode('sharing');

			setStatus('Sending offer...');
			await fetch(API_PATH, {
				method: 'POST',
				body: JSON.stringify({
					type: 'offer',
					target: 'viewer',
					sdp: pc.localDescription?.sdp,
				}),
			});
			offerSent = true;

			setStatus(
				'Broadcasting — waiting for viewer to connect in another tab...',
			);
		} catch (err) {
			setStatus(`Error: ${err}`);
			cleanup();
		}
	}

	async function startWatching(offerSdp: string) {
		try {
			pc = new RTCPeerConnection(ICE_SERVERS);
			pc.ontrack = (event) => {
				setRemoteStream(event.streams[0]);
				setStatus('Receiving stream!');
			};

			await pc.setRemoteDescription(
				new RTCSessionDescription({ type: 'offer', sdp: offerSdp }),
			);
			const answer = await pc.createAnswer();
			await pc.setLocalDescription(answer);

			if (pc.iceGatheringState !== 'complete') {
				await new Promise<void>((resolve) => {
					pc!.addEventListener('icegatheringstatechange', () => {
						if (pc!.iceGatheringState === 'complete') resolve();
					});
				});
			}

			setMode('watching');
			setStatus('Sending answer...');
			await fetch(API_PATH, {
				method: 'POST',
				body: JSON.stringify({
					type: 'answer',
					target: 'sharer',
					sdp: pc.localDescription?.sdp,
				}),
			});

			setStatus('Connected! Watching shared screen.');
		} catch (err) {
			setStatus(`Error: ${err}`);
			cleanup();
		}
	}

	createEffect(() => {
		const s = localStream();
		if (localVideo && s) localVideo.srcObject = s;
	});

	createEffect(() => {
		const s = remoteStream();
		if (remoteVideo && s) remoteVideo.srcObject = s;
	});

	onCleanup(cleanup);

	return (
		<div class="space-y-6">
			<div class="flex items-center gap-3">
				<h1 class="text-2xl font-bold">Screen Share</h1>
				<span class="text-sm text-gray-500">{status()}</span>
			</div>

			<div class="flex gap-2">
				<Show when={mode() === 'idle'}>
					<button
						onClick={startBroadcasting}
						class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
					>
						Share My Screen
					</button>
					<p class="text-sm text-gray-400 self-center">
						Open this page in another tab to watch
					</p>
				</Show>
				<Show when={mode() !== 'idle'}>
					<Button onClick={cleanup} variant="outline">
						Stop
					</Button>
				</Show>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Show when={localStream()}>
					<div>
						<p class="text-sm font-medium mb-2 text-gray-700">Your Screen</p>
						<video
							ref={localVideo!}
							autoplay
							muted
							playsinline
							class="w-full rounded-lg border bg-black"
						/>
					</div>
				</Show>
				<Show when={remoteStream()}>
					<div>
						<p class="text-sm font-medium mb-2 text-gray-700">Remote Screen</p>
						<video
							ref={remoteVideo!}
							autoplay
							playsinline
							class="w-full rounded-lg border bg-black"
						/>
					</div>
				</Show>
			</div>
		</div>
	);
}
