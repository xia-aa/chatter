import { Button } from '@repo/ui/base/button';
import { createEffect, createSignal, onCleanup, Show } from 'solid-js';

const WS_URL = `ws://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:1999`;
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
	let ws: WebSocket | undefined;
	let offerSent = false;

	if (typeof window === 'undefined') return null;

	createEffect(() => {
		const socket = new WebSocket(WS_URL);

		socket.onopen = () => {
			console.log('WS connected');
		};

		socket.onmessage = async (event) => {
			try {
				const msg = JSON.parse(event.data as string);
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
				} else if (msg.type === 'offer' && m !== 'sharing') {
					setStatus('Incoming screen share detected, connecting...');
					pc?.close();
					setRemoteStream(null);
					await startWatching(msg.sdp);
				}
			} catch {
				// Ignore parse errors
			}
		};

		socket.onclose = () => {
			console.log('WS disconnected');
		};

		ws = socket;

		onCleanup(() => {
			socket.close();
			ws = undefined;
		});
	});

	function cleanup() {
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
			ws?.send(
				JSON.stringify({
					type: 'offer',
					target: 'viewer',
					sdp: pc.localDescription?.sdp,
				}),
			);
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
			ws?.send(
				JSON.stringify({
					type: 'answer',
					target: 'sharer',
					sdp: pc.localDescription?.sdp,
				}),
			);

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
					<Button onClick={startBroadcasting}>Share My Screen</Button>
					<p class="text-sm text-gray-400 self-center">
						Open this page in another tab to watch
					</p>
				</Show>
				<Show when={mode() !== 'idle'}>
					<Button onClick={cleanup} variant="destructive">
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
							muted
							class="w-full rounded-lg border bg-black"
						/>
					</div>
				</Show>
			</div>
		</div>
	);
}
