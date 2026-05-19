import { Button } from '@repo/ui/base/button';
import PartySocket from 'partysocket';
import { createEffect, createSignal, For, onCleanup, Show } from 'solid-js';

const ROOM = 'w0';
const ICE_SERVERS = {
	iceServers: [
		{ urls: 'stun:stun.l.google.com:19302' },
		{ urls: 'stun:stun1.l.google.com:19302' },
	],
};

type Mode = 'idle' | 'sharing' | 'watching';

interface DeviceEntry {
	id: number;
	status: string;
	isMe: boolean;
}

export default function ScreenShare() {
	const [mode, setMode] = createSignal<Mode>('idle');
	const [localStream, setLocalStream] = createSignal<MediaStream | null>(null);
	const [remoteStream, setRemoteStream] = createSignal<MediaStream | null>(
		null,
	);
	const [devices, setDevices] = createSignal<DeviceEntry[]>([]);
	const [myId, setMyId] = createSignal<number | undefined>();
	const [showWatch, setShowWatch] = createSignal(false);
	const [statusText, setStatusText] = createSignal('空闲中');

	let pc: RTCPeerConnection | undefined;
	let localVideo: HTMLVideoElement | undefined;
	let remoteVideo: HTMLVideoElement | undefined;
	let conn: PartySocket | undefined;
	let isWaitingOffer = false;
	let retryTimer: ReturnType<typeof setTimeout> | undefined;

	if (typeof window === 'undefined') return null;

	function upsertDevice(id: number, status: string, isMe = false) {
		setDevices((prev) => {
			const existing = prev.find((d) => d.id === id);
			if (existing) {
				return prev.map((d) => (d.id === id ? { ...d, status } : d));
			}
			return [...prev, { id, status, isMe }];
		});
	}

	function removeDevice(id: number) {
		setDevices((prev) => prev.filter((d) => d.id !== id));
	}

	const sortedDevices = () =>
		[...devices()].sort((a, b) => {
			if (a.isMe) return -1;
			if (b.isMe) return 1;
			return 0;
		});

	function setStatus(text: string) {
		setStatusText(text);
		const id = myId();
		if (id !== undefined) {
			upsertDevice(id, text, true);
			conn?.send(JSON.stringify({ type: 'status-update', status: text }));
		}
	}

	function cleanup() {
		if (retryTimer !== undefined) {
			clearTimeout(retryTimer);
			retryTimer = undefined;
		}
		isWaitingOffer = false;
		localStream()
			?.getTracks()
			.forEach((t) => t.stop());
		pc?.close();
		pc = undefined;
		setLocalStream(null);
		setRemoteStream(null);
		setDevices((prev) => prev.filter((d) => d.isMe));
		setShowWatch(false);
		setMode('idle');
		setStatus('空闲中');
	}

	function stopRole() {
		conn?.send(JSON.stringify({ type: 'stop' }));
		cleanup();
	}

	async function startBroadcasting() {
		try {
			setStatus('请求屏幕捕获...');
			const stream = await navigator.mediaDevices.getDisplayMedia({
				video: true,
			});
			setLocalStream(stream);
			stream.getVideoTracks()[0].addEventListener('ended', stopRole);

			setStatus('创建 PeerConnection 并生成连接协议(Offer)...');
			pc = new RTCPeerConnection(ICE_SERVERS);
			stream.getTracks().forEach((track) => pc!.addTrack(track, stream));
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
			setStatus('发送 Offer...');
			conn?.send(
				JSON.stringify({ type: 'offer', sdp: pc!.localDescription?.sdp }),
			);
			setStatus('等待观看者(Viewer)');
		} catch (err) {
			setStatus(`错误: ${err}`);
			cleanup();
		}
	}

	async function requestWatch() {
		if (isWaitingOffer) {
			setStatus('已在等待 Offer，请稍候...');
			return;
		}
		isWaitingOffer = true;
		setStatus('请求观看...');
		conn?.send(JSON.stringify({ type: 'request-offer' }));
		setStatus('等待 Offer...');
	}

	async function startWatching(offerSdp: string) {
		try {
			pc?.close();
			setStatus('创建 PeerConnection...');
			pc = new RTCPeerConnection(ICE_SERVERS);
			pc.ontrack = (event) => {
				setRemoteStream(event.streams[0]);
				setStatus('观看中');
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
			setStatus('发送 Answer...');
			conn?.send(
				JSON.stringify({ type: 'answer', sdp: pc.localDescription?.sdp }),
			);
			setStatus('观看中');
		} catch (err) {
			setStatus(`错误: ${err}`);
			cleanup();
		}
	}

	async function prepareNewOffer() {
		setStatus('生成新连接协议(Offer)...');
		const stream = localStream();
		if (!stream) return;

		pc?.close();

		pc = new RTCPeerConnection(ICE_SERVERS);
		stream.getTracks().forEach((track) => pc!.addTrack(track, stream));
		pc.ontrack = (event) => {
			setRemoteStream(event.streams[0]);
		};

		try {
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);

			if (pc.iceGatheringState !== 'complete') {
				await new Promise<void>((resolve) => {
					pc!.addEventListener('icegatheringstatechange', () => {
						if (pc!.iceGatheringState === 'complete') resolve();
					});
				});
			}

			conn?.send(
				JSON.stringify({ type: 'offer', sdp: pc!.localDescription?.sdp }),
			);
		} catch {
			setStatus('准备新连接协议(Offer)失败');
		}
	}

	async function reconnectSharer(newSdp: string) {
		const stream = localStream();
		if (!stream) return;

		setStatus('观看者已断开，重建连接...');
		pc?.close();

		pc = new RTCPeerConnection(ICE_SERVERS);
		stream.getTracks().forEach((track) => pc!.addTrack(track, stream));
		pc.ontrack = (event) => {
			setRemoteStream(event.streams[0]);
		};

		try {
			await pc.setRemoteDescription(
				new RTCSessionDescription({ type: 'answer', sdp: newSdp }),
			);
			setStatus('分享中');
		} catch {
			const offer = await pc.createOffer({ iceRestart: true });
			await pc.setLocalDescription(offer);

			if (pc.iceGatheringState !== 'complete') {
				await new Promise<void>((resolve) => {
					pc!.addEventListener('icegatheringstatechange', () => {
						if (pc!.iceGatheringState === 'complete') resolve();
					});
				});
			}

			conn?.send(
				JSON.stringify({ type: 'offer', sdp: pc!.localDescription?.sdp }),
			);
			setStatus('等待观看者(Viewer)重新连接');
		}
	}

	async function reconnectViewer(offerSdp: string) {
		setStatus('分享者已断开或重新分享，重建连接...');
		pc?.close();
		setRemoteStream(null);
		await startWatching(offerSdp);
	}

	createEffect(() => {
		const host =
			import.meta.env.VITE_PARTYKIT_HOST ??
			(typeof window !== 'undefined' ? window.location.host : 'localhost:1999');
		const socket = new PartySocket({ host, room: ROOM });
		conn = socket;

		socket.addEventListener('message', async (event) => {
			try {
				const msg = JSON.parse(event.data as string);

				switch (msg.type) {
					case 'registered':
						setMyId(msg.id);
						setStatus('空闲中');
						break;

					case 'peer-list':
						if (Array.isArray(msg.peers)) {
							setDevices(
								msg.peers.map((p: { id: number; status: string }) => ({
									id: p.id,
									status: p.status,
									isMe: p.id === myId(),
								})),
							);
						}
						break;

					case 'peer-joined':
						upsertDevice(msg.id, msg.status, msg.id === myId());
						break;

					case 'peer-left':
						removeDevice(msg.id);
						break;

					case 'peer-status':
						upsertDevice(msg.id, msg.status, msg.id === myId());
						break;

					case 'sharer-available':
						if (mode() === 'idle') {
							setShowWatch(true);
						}
						break;

					case 'sharer-left':
						if (mode() === 'watching') {
							setStatus('分享者已离开');
							cleanup();
						} else if (mode() === 'idle') {
							setShowWatch(false);
						}
						break;

					case 'viewer-left':
						if (mode() === 'sharing') {
							await prepareNewOffer();
							setStatus('等待观看者(Viewer)...');
						}
						break;

					case 'offer':
						isWaitingOffer = false;
						if (retryTimer !== undefined) {
							clearTimeout(retryTimer);
							retryTimer = undefined;
						}
						if (typeof msg.sdp === 'string') {
							if (mode() === 'watching') {
								await reconnectViewer(msg.sdp);
							} else if (mode() === 'idle') {
								setStatus('检测到分享，连接中...');
								await startWatching(msg.sdp);
							}
						}
						break;

					case 'answer':
						if (mode() === 'sharing' && typeof msg.sdp === 'string') {
							if (pc?.remoteDescription) {
								await reconnectSharer(msg.sdp);
							} else {
								try {
									await pc?.setRemoteDescription(
										new RTCSessionDescription({
											type: 'answer',
											sdp: msg.sdp,
										}),
									);
									setStatus('分享中');
								} catch {
									// stale answer, ignore
								}
							}
						}
						break;

					case 'offer-regenerating':
						setStatus('分享者正在重新生成连接协议，请稍候...');
						retryTimer = setTimeout(() => {
							if (mode() === 'idle') {
								conn?.send(JSON.stringify({ type: 'request-offer' }));
							}
						}, 1000);
						break;

					case 'error':
						isWaitingOffer = false;
						if (retryTimer !== undefined) {
							clearTimeout(retryTimer);
							retryTimer = undefined;
						}
						setStatus(`错误: ${msg.message}`);
						break;
				}
			} catch {
				// ignore parse errors
			}
		});

		onCleanup(() => {
			socket.close();
			conn = undefined;
		});
	});

	createEffect(() => {
		const s = localStream();
		if (localVideo && s) localVideo.srcObject = s;
	});

	createEffect(() => {
		const s = remoteStream();
		if (remoteVideo && s) remoteVideo.srcObject = s;
	});

	onCleanup(() => {
		if (retryTimer !== undefined) {
			clearTimeout(retryTimer);
			retryTimer = undefined;
		}
		localStream()
			?.getTracks()
			.forEach((t) => t.stop());
		pc?.close();
	});

	return (
		<div class="space-y-6">
			<div class="flex items-center gap-3">
				<h1 class="text-2xl font-bold">屏幕共享 w0</h1>
				<span class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
					PartyKit
				</span>
			</div>

			<Show when={devices().length > 0}>
				<div class="rounded-lg border bg-card p-3 space-y-1">
					<For each={sortedDevices()}>
						{(d) => (
							<div
								class={`flex items-center gap-2 text-sm ${d.isMe ? 'font-medium' : ''}`}
							>
								<span class="font-mono text-xs">{d.id}</span>
								<span class="text-muted-foreground">{d.status}</span>
								<Show when={d.isMe}>
									<span class="inline-flex items-center rounded bg-blue-500 px-1.5 py-0.5 text-xs font-medium text-white">
										我
									</span>
								</Show>
							</div>
						)}
					</For>
				</div>
			</Show>

			<div class="flex items-center gap-2">
				<Show when={mode() === 'idle'}>
					<Button onClick={startBroadcasting}>分享屏幕 (Share)</Button>
					<Show when={showWatch()}>
						<Button onClick={requestWatch} variant="outline">
							观看 (Watch)
						</Button>
					</Show>
				</Show>
				<Show when={mode() !== 'idle'}>
					<Button onClick={stopRole} variant="destructive">
						停止 (Stop)
					</Button>
				</Show>
				<span class="text-sm text-muted-foreground">{statusText()}</span>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Show when={localStream()}>
					<div>
						<p class="text-sm font-medium mb-2">我的屏幕</p>
						<video
							ref={localVideo}
							autoplay
							muted
							playsinline
							class="w-full rounded-lg border bg-black aspect-video object-contain"
						/>
					</div>
				</Show>
				<Show when={remoteStream()}>
					<div>
						<p class="text-sm font-medium mb-2">对方的屏幕</p>
						<video
							ref={remoteVideo}
							autoplay
							playsinline
							muted
							class="w-full rounded-lg border bg-black aspect-video object-contain"
						/>
					</div>
				</Show>
			</div>
		</div>
	);
}
