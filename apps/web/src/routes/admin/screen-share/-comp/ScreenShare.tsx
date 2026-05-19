import { to } from '@repo/shared/lib/utils/fp.ts';
import { Button } from '@repo/ui/base/button';
import { createEffect, createSignal, onCleanup, Show } from 'solid-js';

const API_PATH = '/admin/pubsub/api';
const TOPIC = 'screen-share';
const ICE_SERVERS = {
	iceServers: [
		{ urls: 'stun:stun.l.google.com:19302' },
		{ urls: 'stun:stun1.l.google.com:19302' },
		{
			urls: 'turn:openrelay.metered.ca:80',
			username: 'openrelayproject',
			credential: 'openrelayproject',
		},
	],
};

function enforceVP8(sdp: string): string {
	const videoMatch = sdp.match(/^m=video\s+\d+\s+[\w/]+\s+(.+)$/m);
	if (!videoMatch) return sdp;
	const allPTs = videoMatch[1].trim().split(/\s+/);
	const h264Set = new Set(
		allPTs.filter((pt) =>
			sdp.match(new RegExp(`^a=rtpmap:${pt}\\s+H264`, 'm')),
		),
	);
	if (!h264Set.size) return sdp;
	const filteredPTs = allPTs.filter((pt) => !h264Set.has(pt));
	if (!filteredPTs.length) return sdp;

	const lines = sdp.split('\n');
	const result = lines
		.map((line) => {
			if (line.startsWith('m=video')) {
				return line.replace(allPTs.join(' '), filteredPTs.join(' '));
			}
			if (
				line.startsWith('a=rtpmap:') ||
				line.startsWith('a=fmtp:') ||
				line.startsWith('a=rtcp-fb:')
			) {
				const pt = line.split(/[: ]/)[2];
				if (h264Set.has(pt)) return null;
			}
			return line;
		})
		.filter((l): l is string => l !== null)
		.join('\n');
	return result;
}

function flushCandidates(buffer: any[], sender: RTCPeerConnection | undefined) {
	for (const c of buffer.splice(0)) {
		sender
			?.addIceCandidate(
				new RTCIceCandidate({
					candidate: c.candidate,
					sdpMid: c.sdpMid,
					sdpMLineIndex: c.sdpMLineIndex,
				}),
			)
			.catch(() => {});
	}
}

export const ScreenShare = () => {
	const [mode, setMode] = createSignal<'idle' | 'sharing' | 'watching'>('idle');
	const [localStream, setLocalStream] = createSignal<MediaStream | null>(null);
	const [remoteStream, setRemoteStream] = createSignal<MediaStream | null>(
		null,
	);
	const [status, setStatus] = createSignal(
		'Open this page in two tabs — share in one, watch in the other',
	);

	const [localVideoEl, setLocalVideoEl] = createSignal<HTMLVideoElement>();
	const [remoteVideoEl, setRemoteVideoEl] = createSignal<HTMLVideoElement>();

	let pc: RTCPeerConnection | undefined;
	let sseReader: ReadableStreamDefaultReader | undefined;
	let sseCancelled = false;
	const candidateBuffer: any[] = [];

	createEffect(() => {
		let cancelled = false;
		sseCancelled = false;

		const connectSSE = async () => {
			while (!cancelled && !sseCancelled) {
				try {
					const response = await fetch(`${API_PATH}?topic=${TOPIC}`);
					const reader = response.body?.getReader();
					if (!reader || cancelled) return;
					sseReader = reader;
					const decoder = new TextDecoder();
					console.log('SSE connected');
					while (!cancelled && !sseCancelled) {
						const { done, value } = await reader.read();
						if (done) break;
						for (const line of decoder
							.decode(value, { stream: true })
							.split('\n')
							.filter(Boolean)) {
							if (cancelled || sseCancelled) break;

							const [msg] = to(() => JSON.parse(line));
							if (!msg || msg.type === 'ping') continue;

							const m = mode();
							console.log('SSE msg', msg.type, msg.target, 'mode', m);
							if (msg.type === 'session-end') {
								console.log('session ended by remote peer');
								stopSession(true);
							} else if (m === 'sharing' && msg.type === 'answer' && pc) {
								await pc
									.setRemoteDescription(
										new RTCSessionDescription({
											type: 'answer',
											sdp: msg.sdp,
										}),
									)
									.catch(() => {});
								flushCandidates(candidateBuffer, pc);
							} else if (msg.type === 'offer' && m !== 'sharing') {
								if (pc) {
									stopSession(false);
								}
								setStatus('Incoming screen share detected, connecting...');
								await startWatching(msg.sdp);
								flushCandidates(candidateBuffer, pc);
							} else if (msg.type === 'ice-candidate') {
								if (pc?.remoteDescription) {
									pc.addIceCandidate(
										new RTCIceCandidate({
											candidate: msg.candidate,
											sdpMid: msg.sdpMid,
											sdpMLineIndex: msg.sdpMLineIndex,
										}),
									).catch(() => {});
								} else {
									candidateBuffer.push(msg);
								}
							}
						}
					}
					console.log('SSE disconnected, reconnecting...');
					await new Promise((r) => setTimeout(r, 500));
				} catch (err) {
					if (!cancelled) {
						console.error('SSE error:', err);
						await new Promise((r) => setTimeout(r, 1000));
					}
				}
			}
		};

		connectSSE();

		onCleanup(() => {
			cancelled = true;
			sseCancelled = true;
			sseReader?.cancel();
		});
	});

	function stopSession(resetStatus = true) {
		const wasSharing = mode() === 'sharing';
		localStream()
			?.getTracks()
			.forEach((t) => {
				t.stop();
			});
		pc?.close();
		pc = undefined;
		candidateBuffer.length = 0;
		setLocalStream(null);
		setRemoteStream(null);
		setMode('idle');
		if (resetStatus) {
			setStatus(
				'Open this page in two tabs — share in one, watch in the other',
			);
		}
		if (wasSharing) {
			fetch(API_PATH, {
				method: 'POST',
				body: JSON.stringify({
					type: 'session-end',
					topic: TOPIC,
				}),
			}).catch(() => {});
		}
	}

	async function startBroadcasting() {
		try {
			setStatus('Requesting screen capture...');
			const stream = await navigator.mediaDevices.getDisplayMedia({
				video: true,
			});
			setLocalStream(stream);
			stream.getVideoTracks()[0].addEventListener('ended', () => stopSession(true));

			setStatus('Creating peer connection...');
			const conn = new RTCPeerConnection(ICE_SERVERS);
			pc = conn;

			conn.onicecandidate = (event) => {
				if (!event.candidate) return;
				fetch(API_PATH, {
					method: 'POST',
					body: JSON.stringify({
						type: 'ice-candidate',
						topic: TOPIC,
						target: 'viewer',
						candidate: event.candidate.candidate,
						sdpMid: event.candidate.sdpMid,
						sdpMLineIndex: event.candidate.sdpMLineIndex,
					}),
				});
			};
			conn.oniceconnectionstatechange = () =>
				console.log('sharer ICE:', conn.iceConnectionState);
			conn.onconnectionstatechange = () =>
				console.log('sharer conn:', conn.connectionState);
			conn.onicegatheringstatechange = () =>
				console.log('sharer gather:', conn.iceGatheringState);
			conn.ontrack = (event) => {
				setRemoteStream(event.streams[0]);
			};

			stream.getTracks().forEach((track) => {
				conn.addTrack(track, stream);
			});

			const offer = await conn.createOffer();
			console.log(
				'offer SDP VP8:',
				offer.sdp?.includes('VP8'),
				'H264:',
				offer.sdp?.includes('H264'),
			);
			await conn.setLocalDescription(offer);

			setMode('sharing');
			await fetch(API_PATH, {
				method: 'POST',
				body: JSON.stringify({
					type: 'offer',
					topic: TOPIC,
					target: 'viewer',
					sdp: enforceVP8(conn.localDescription!.sdp),
				}),
			});
			setStatus(
				'Broadcasting — waiting for viewer to connect in another tab...',
			);
		} catch (err) {
			console.error('Broadcast error:', err);
			stopSession(false);
			setStatus(`Error: ${err}`);
		}
	}

	async function startWatching(offerSdp: string) {
		try {
			const conn = new RTCPeerConnection(ICE_SERVERS);
			pc = conn;

			conn.onicecandidate = (event) => {
				if (!event.candidate) return;
				fetch(API_PATH, {
					method: 'POST',
					body: JSON.stringify({
						type: 'ice-candidate',
						topic: TOPIC,
						target: 'sharer',
						candidate: event.candidate.candidate,
						sdpMid: event.candidate.sdpMid,
						sdpMLineIndex: event.candidate.sdpMLineIndex,
					}),
				});
			};
			conn.oniceconnectionstatechange = () =>
				console.log('viewer ICE:', conn.iceConnectionState);
			conn.onconnectionstatechange = () =>
				console.log('viewer conn:', conn.connectionState);
			conn.onicegatheringstatechange = () =>
				console.log('viewer gather:', conn.iceGatheringState);
			conn.ontrack = (event) => {
				setRemoteStream(event.streams[0]);
				setStatus('Receiving stream!');
			};

			await conn.setRemoteDescription(
				new RTCSessionDescription({ type: 'offer', sdp: offerSdp }),
			);
			console.log('remoteDescription set');

			flushCandidates(candidateBuffer, conn);

			const answer = await conn.createAnswer();
			console.log('answer created');
			await conn.setLocalDescription(answer);
			console.log('localDescription set');

			flushCandidates(candidateBuffer, conn);

			console.log(
				'answer SDP VP8:',
				answer.sdp?.includes('VP8'),
				'H264:',
				answer.sdp?.includes('H264'),
			);

			setMode('watching');
			await fetch(API_PATH, {
				method: 'POST',
				body: JSON.stringify({
					type: 'answer',
					topic: TOPIC,
					target: 'sharer',
					sdp: conn.localDescription?.sdp,
				}),
			});
			setStatus('Connected! Watching shared screen.');
		} catch (err) {
			console.error('Watch error:', err);
			stopSession(false);
			setStatus(`Error: ${err}`);
		}
	}

	createEffect(() => {
		const el = localVideoEl();
		const s = localStream();
		if (el && s) el.srcObject = s;
	});

	createEffect(() => {
		const el = remoteVideoEl();
		const s = remoteStream();
		if (el && s && el.srcObject !== s) {
			el.srcObject = s;
		}
	});

	onCleanup(stopSession);

	return (
		<div class="space-y-6">
			<div class="flex items-center gap-3">
				<h1 class="text-2xl font-bold">Screen Share</h1>
				<span class="text-sm text-gray-500">{status()}</span>
			</div>

			<div class="flex gap-2">
				<Show when={mode() === 'idle'}>
					<Button onClick={startBroadcasting}>Share My Screen</Button>
					<p>Open this page in another tab to watch</p>
				</Show>
				<Show when={mode() !== 'idle'}>
					<Button onClick={() => stopSession(true)} variant="outline">
						Stop
					</Button>
				</Show>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Show when={localStream()}>
					<div>
						<p class="text-sm font-medium mb-2 text-gray-700">Your Screen</p>
						<video
							ref={setLocalVideoEl}
							autoplay
							muted
							playsinline
							class="w-full rounded-lg border bg-black"
						/>
					</div>
				</Show>

				<div class={!remoteStream() ? 'hidden' : ''}>
					<p>Remote Screen</p>
					<video
						ref={setRemoteVideoEl}
						autoplay
						playsinline
						muted
						class="w-full rounded-lg border bg-black"
					/>
				</div>
			</div>
		</div>
	);
};
