import { clientEnv } from '@repo/shared/env/env._client';
import { to } from '@repo/shared/lib/utils/fp';
import { Button } from '@repo/ui/base/button';
import { createEffect, createSignal, onCleanup, Show } from 'solid-js';

const API_PATH = '/admin/s1/signal';
const ICE_SERVERS = {
	iceServers: clientEnv.DEV
		? []
		: [
				{ urls: 'stun:stun.l.google.com:19302' },
				{ urls: 'stun:stun1.l.google.com:19302' },
				{
					urls: 'turn:openrelay.metered.ca:80',
					username: 'openrelayproject',
					credential: 'openrelayproject',
				},
				{
					urls: 'turn:openrelay.metered.ca:443?transport=tcp',
					username: 'openrelayproject',
					credential: 'openrelayproject',
				},
			],
};
const setupPcLogging = (conn: RTCPeerConnection, label: string) => {
	conn.oniceconnectionstatechange = () => {
		console.log(`[${label}] ICE connection:`, conn.iceConnectionState);
	};
	conn.onconnectionstatechange = () => {
		console.log(`[${label}] Connection:`, conn.connectionState);
	};
	conn.onicegatheringstatechange = () => {
		console.log(`[${label}] Gathering:`, conn.iceGatheringState);
	};
};
function postSignal(msg: object) {
	fetch(API_PATH, {
		method: 'POST',
		body: JSON.stringify(msg),
	}).catch(() => {});
}
export function ScreenShare() {
	const [mode, setMode] = createSignal<'idle' | 'sharing' | 'watching'>('idle');
	const [localStream, setLocalStream] = createSignal<MediaStream | null>(null);
	const [remoteStream, setRemoteStream] = createSignal<MediaStream | null>(
		null,
	);
	const [status, setStatus] = createSignal(
		'Open this page in two tabs — share in one, watch in the other',
	);
	const [viewerIntent, setViewerIntent] = createSignal(false);

	const [localVideoEl, setLocalVideoEl] = createSignal<HTMLVideoElement>();
	const [remoteVideoEl, setRemoteVideoEl] = createSignal<HTMLVideoElement>();

	let pc: RTCPeerConnection | undefined;
	let sseReader: ReadableStreamDefaultReader | undefined;
	let offerSent = false;
	const candidateBuffer: any[] = [];
	// SSR guard
	if (typeof window === 'undefined') return null;
	const flushCandidates = async () => {
		await Promise.all(
			candidateBuffer.splice(0).map((c) =>
				pc!
					.addIceCandidate(
						new RTCIceCandidate({
							candidate: c.candidate,
							sdpMid: c.sdpMid,
							sdpMLineIndex: c.sdpMLineIndex,
						}),
					)
					.catch((e) => console.error('[viewer] addIceCandidate error:', e)),
			),
		);
	};

	createEffect(() => {
		let cancelled = false;

		const connectSSE = async () => {
			try {
				const response = await fetch(API_PATH);
				const reader = response.body?.getReader();
				if (!reader || cancelled) return;
				sseReader = reader;
				const decoder = new TextDecoder();
				let lineBuffer = '';
				while (!cancelled) {
					const { done, value } = await reader.read();
					if (done) break;

					const parts = (
						lineBuffer + decoder.decode(value, { stream: true })
					).split('\n');
					lineBuffer = parts.pop() ?? '';
					for (const line of parts.filter(Boolean)) {
						if (cancelled) break;
						const [msg, err] = to(() => JSON.parse(line));
						if (err) {
							console.error('Invalid JSON from SSE:', line.slice(0, 100));
						}
						const m = mode();
						if (
							m === 'sharing' &&
							msg.type === 'answer' &&
							offerSent &&
							msg.sdp
						) {
							try {
								await pc?.setRemoteDescription(
									new RTCSessionDescription({ type: 'answer', sdp: msg.sdp }),
								);
								console.log('Flushing', candidateBuffer.length, 'candidates');
								flushCandidates();
								setStatus('Connected! Screen is being viewed');
							} catch {
								// Stale answer from previous session — ignore
							}
						} else if (msg.type === 'ice-candidate') {
							if (pc) {
								pc.addIceCandidate(
									new RTCIceCandidate({
										candidate: msg.candidate,
										sdpMid: msg.sdpMid,
										sdpMLineIndex: msg.sdpMLineIndex,
									}),
								).catch((e) =>
									console.error('[viewer] addIceCandidate error:', e),
								);
							} else {
								console.log('Buffering candidate until PC is ready:', {
									candidateBuffer,
									msg,
								});
								candidateBuffer.push(msg);
							}
						} else if (
							m === 'idle' &&
							viewerIntent() &&
							msg.type === 'offer' &&
							!pc &&
							msg.sdp
						) {
							setStatus('Incoming screen share detected, connecting...');
							await startWatching(msg.sdp);
							console.log('Flushing', candidateBuffer.length, 'candidates');
							flushCandidates();
						} else if (
							m === 'idle' &&
							!viewerIntent() &&
							msg.type === 'offer'
						) {
							console.log('Offer available — click "Watch" to connect');
							setStatus('Screen share detected — click "Watch" to connect');
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
			sseReader?.cancel();
		});
	});

	async function startBroadcasting() {
		try {
			setStatus('Requesting screen capture...');
			const stream = await navigator.mediaDevices.getDisplayMedia({
				video: true,
			});
			setLocalStream(stream);
			stream.getVideoTracks()[0].addEventListener('ended', () => {
				stopSession();
			});

			setStatus('Creating peer connection...');
			pc = new RTCPeerConnection(ICE_SERVERS);
			stream.getTracks().forEach((track) => {
				pc!.addTrack(track, stream);
			});
			setupPcLogging(pc, 'sharer');
			pc.onicecandidate = (e) => {
				if (!e.candidate) {
					console.log('[sharer] onicecandidate e.candidate', e.candidate);
					return;
				}
				console.log(
					'[sharer] ICE candidate:',
					e.candidate.type,
					e.candidate.address,
					e.candidate.protocol,
				);
				postSignal({
					type: 'ice-candidate',
					target: 'viewer',
					candidate: e.candidate.candidate,
					sdpMid: e.candidate.sdpMid,
					sdpMLineIndex: e.candidate.sdpMLineIndex,
				});
			};

			const offer = await pc.createOffer(); // sdp 记录 Offer 支持哪些音视频编码、采样率、加密算法、媒体内容
			await pc.setLocalDescription(offer); // 让自己的浏览器进入 等待链接状态

			if (pc.iceGatheringState !== 'complete') {
				await new Promise<void>((resolve) => {
					pc!.addEventListener('icegatheringstatechange', () => {
						if (pc!.iceGatheringState === 'complete') resolve();
					});
				});
			}
			const postOffer = async (pc: RTCPeerConnection) => {
				setStatus('Sending offer...');
				const data = {
					type: 'offer',
					target: 'viewer',
					sdp: pc.localDescription?.sdp,
				};
				console.log('Posting offer:', data);
				await fetch(API_PATH, {
					method: 'POST',
					body: JSON.stringify(data),
				});
			};
			setMode('sharing');
			await postOffer(pc!);
			offerSent = true;

			setStatus(
				'Broadcasting — waiting for viewer to connect in another tab...',
			);
		} catch (err) {
			setStatus(`Error: ${err}`);
			stopSession();
		}
	}

	async function startWatching(offerSdp: string) {
		console.log(
			'[viewer] SDP has candidates:',
			offerSdp.includes('a=candidate:'),
		);
		try {
			pc = new RTCPeerConnection(ICE_SERVERS);
			setupPcLogging(pc, 'viewer');

			pc.onicecandidate = (e) => {
				if (!e.candidate) {
					console.log('[viewer] ICE gathering complete');
					return;
				}
				console.log(
					'[viewer] ICE candidate:',
					e.candidate.type,
					e.candidate.address,
					e.candidate.protocol,
				);
				postSignal({
					type: 'ice-candidate',
					target: 'sharer',
					candidate: e.candidate.candidate,
					sdpMid: e.candidate.sdpMid,
					sdpMLineIndex: e.candidate.sdpMLineIndex,
				});
			};

			pc.ontrack = (event) => {
				setRemoteStream(event.streams[0]);
				setStatus('Receiving stream!');
			};

			await pc.setRemoteDescription(
				new RTCSessionDescription({ type: 'offer', sdp: offerSdp }),
			);
			// Force sendrecv so Firefox gathers ICE candidates for answer
			pc.getTransceivers().forEach((t) => {
				if (t.direction !== 'sendrecv') t.direction = 'sendrecv';
			});
			console.log(
				'[viewer] Pending candidates in buffer:',
				candidateBuffer.length,
			);
			await flushCandidates();
			const answer = await pc.createAnswer();
			console.log('[viewer] createAnswer done', answer.type);
			await pc.setLocalDescription(answer);
			console.log(
				'[viewer] setLocalDescription done, state:',
				pc.iceGatheringState,
			);
			if (pc.iceGatheringState !== 'complete') {
				console.log(
					'[viewer] Waiting for ICE gathering, current state:',
					pc.iceGatheringState,
				);
				await new Promise<void>((resolve) => {
					const timeout = setTimeout(() => {
						console.log(
							'[viewer] ICE gathering timed out, proceeding without wait',
						);
						resolve();
					}, 2000);
					pc!.addEventListener('icegatheringstatechange', () => {
						if (pc!.iceGatheringState === 'complete') {
							clearTimeout(timeout);
							resolve();
						}
					});
				});
			}

			setMode('watching');
			setStatus('Sending answer...');
			const answerData = {
				type: 'answer',
				target: 'sharer',
				sdp: pc.localDescription?.sdp,
			};
			console.log('answer posting :', answerData);
			await fetch(API_PATH, {
				method: 'POST',
				body: JSON.stringify(answerData),
			});

			setStatus('Connected! Watching shared screen.');
		} catch (err) {
			setStatus(`Error: ${err}`);
			stopSession();
		}
	}

	async function onWatchClick() {
		setViewerIntent(true);
		setStatus('Fetching available screen share...');
		try {
			const res = await fetch(`${API_PATH}?get=offer`);
			const offer = await res.json();
			if (offer?.type === 'offer' && offer.sdp) {
				// console.log('Flushing', candidateBuffer.length, 'candidates');
				// flushCandidates();
				await startWatching(offer.sdp);
			} else {
				setStatus('Waiting for someone to share their screen...');
			}
		} catch (err) {
			setStatus(`Error fetching offer: ${err}`);
		}
	}

	async function stopSession() {
		candidateBuffer.length = 0;
		localStream()
			?.getTracks()
			.forEach((t) => {
				t.stop();
			});
		pc?.close();
		pc = undefined;
		offerSent = false;
		setViewerIntent(false);
		setLocalStream(null);
		setRemoteStream(null);
		setMode('idle');
		setStatus('Open this page in two tabs — share in one, watch in the other');
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

	onCleanup(() => {
		sseReader?.cancel();
		pc?.close();
	});

	return (
		<div class="space-y-6">
			<div class="flex items-center gap-3">
				<h1 class="text-2xl font-bold">Screen Share</h1>
				<span class="text-sm text-gray-500">{status()}</span>
			</div>

			<div class="flex gap-2">
				<Show when={mode() === 'idle'}>
					<Button onClick={startBroadcasting}>Share My Screen</Button>
					<Button onClick={onWatchClick} variant="outline">
						Watch
					</Button>
					<p class="text-sm text-gray-400 self-center">
						Open this page in another tab/browser to share or watch
					</p>
				</Show>
				<Show when={mode() !== 'idle'}>
					<Button onClick={stopSession} variant="outline">
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
				<Show when={remoteStream()}>
					<div>
						<p class="text-sm font-medium mb-2 text-gray-700">Remote Screen</p>
						<video
							ref={setRemoteVideoEl}
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
