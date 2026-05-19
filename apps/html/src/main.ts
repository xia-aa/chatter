import './style.css';
import PartySocket from 'partysocket';

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

let mode: Mode = 'idle';
let pc: RTCPeerConnection | undefined;
let localStream: MediaStream | undefined;
let myId: number | undefined;
let isWaitingOffer = false;
const devices: DeviceEntry[] = [];

const $ = (id: string) => document.getElementById(id)!;
const deviceListEl = $('device-list') as HTMLDivElement;
const idleControls = $('idle-controls');
const activeControls = $('active-controls');
const btnShare = $('btn-share') as HTMLButtonElement;
const btnWatch = $('btn-watch') as HTMLButtonElement;
const btnStop = $('btn-stop') as HTMLButtonElement;
const localContainer = $('local-container');
const remoteContainer = $('remote-container');
const localVideo = $('local-video') as HTMLVideoElement;
const remoteVideo = $('remote-video') as HTMLVideoElement;

function upsertDevice(id: number, status: string, isMe = false) {
	const existing = devices.find(d => d.id === id);
	if (existing) {
		existing.status = status;
	} else {
		devices.push({ id, status, isMe });
	}
	renderDeviceList();
}

function removeDevice(id: number) {
	const idx = devices.findIndex(d => d.id === id);
	if (idx !== -1) {
		devices.splice(idx, 1);
		renderDeviceList();
	}
}

function renderDeviceList() {
	const sorted = [...devices].sort((a, b) => {
		if (a.isMe) return -1;
		if (b.isMe) return 1;
		return 0;
	});
	deviceListEl.innerHTML = '';
	for (const d of sorted) {
		const row = document.createElement('div');
		row.className = 'device-row';
		if (d.isMe) row.classList.add('me');

		const idSpan = document.createElement('span');
		idSpan.className = 'device-id';
		idSpan.textContent = String(d.id);

		const statusSpan = document.createElement('span');
		statusSpan.className = 'device-status';
		statusSpan.textContent = d.status;

		row.append(idSpan, statusSpan);

		if (d.isMe) {
			const badge = document.createElement('span');
			badge.className = 'device-badge';
			badge.textContent = '我';
			row.append(badge);
		}

		deviceListEl.append(row);
	}
}

function setMyStatus(text: string) {
	if (myId !== undefined) {
		upsertDevice(myId, text, true);
		conn.send(JSON.stringify({ type: 'status-update', status: text }));
	}
}

function showIdle(showWatch: boolean) {
	mode = 'idle';
	idleControls.classList.remove('hidden');
	activeControls.classList.add('hidden');
	btnWatch.classList.toggle('hidden', !showWatch);
}

function showActive() {
	idleControls.classList.add('hidden');
	activeControls.classList.remove('hidden');
}

function cleanup() {
	localStream?.getTracks().forEach((t) => t.stop());
	pc?.close();
	pc = undefined;
	localStream = undefined;
	localContainer.classList.add('hidden');
	remoteContainer.classList.add('hidden');
	localVideo.srcObject = null;
	remoteVideo.srcObject = null;
	const others = devices.filter(d => !d.isMe);
	others.forEach(d => removeDevice(d.id));
	showIdle(false);
	setMyStatus('空闲中');
}

function stopRole() {
	conn.send(JSON.stringify({ type: 'stop' }));
	cleanup();
}

async function startBroadcasting() {
	try {
		setMyStatus('请求屏幕捕获...');
		const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
		localStream = stream;
		localVideo.srcObject = stream;
		localContainer.classList.remove('hidden');
		stream.getVideoTracks()[0].addEventListener('ended', stopRole);

		setMyStatus('创建 PeerConnection 并生成连接协议(Offer)...');
		pc = new RTCPeerConnection(ICE_SERVERS);
		stream.getTracks().forEach((track) => pc!.addTrack(track, stream));
		pc.ontrack = (event) => {
			remoteVideo.srcObject = event.streams[0];
			remoteContainer.classList.remove('hidden');
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

		mode = 'sharing';
		showActive();
		setMyStatus('发送 Offer...');
		conn.send(JSON.stringify({ type: 'offer', sdp: pc!.localDescription?.sdp }));
		setMyStatus('等待观看者(Viewer)');
	} catch (err) {
		setMyStatus(`错误: ${err}`);
		cleanup();
	}
}

async function requestWatch() {
	if (isWaitingOffer) {
		setMyStatus('已在等待 Offer，请稍候...');
		return;
	}
	try {
		isWaitingOffer = true;
		setMyStatus('请求观看...');
		conn.send(JSON.stringify({ type: 'request-offer' }));
		setMyStatus('等待 Offer...');
	} catch (err) {
		setMyStatus(`错误: ${err}`);
	}
}

async function startWatching(offerSdp: string) {
	try {
		setMyStatus('创建 PeerConnection...');
		pc = new RTCPeerConnection(ICE_SERVERS);
		pc.ontrack = (event) => {
			setMyStatus('观看中');
			remoteVideo.srcObject = event.streams[0];
			remoteContainer.classList.remove('hidden');
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

		mode = 'watching';
		showActive();
		setMyStatus('发送 Answer...');
		conn.send(JSON.stringify({ type: 'answer', sdp: pc.localDescription?.sdp }));
		setMyStatus('观看中');
	} catch (err) {
		setMyStatus(`错误: ${err}`);
		cleanup();
	}
}

async function prepareNewOffer() {
	setMyStatus('生成新连接协议(Offer)...');
	const stream = localStream;
	if (!stream) return;

	pc?.close();

	pc = new RTCPeerConnection(ICE_SERVERS);
	stream.getTracks().forEach((track) => pc!.addTrack(track, stream));
	pc.ontrack = (event) => {
		remoteVideo.srcObject = event.streams[0];
		remoteContainer.classList.remove('hidden');
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

		conn.send(JSON.stringify({ type: 'offer', sdp: pc!.localDescription?.sdp }));
	} catch {
		setMyStatus('准备新连接协议(Offer)失败');
	}
}

async function reconnectSharer(newSdp: string) {
	const stream = localStream;
	if (!stream) return;

	setMyStatus('观看者已断开，重建连接...');
	pc?.close();

	pc = new RTCPeerConnection(ICE_SERVERS);
	stream.getTracks().forEach((track) => pc!.addTrack(track, stream));
	pc.ontrack = (event) => {
		remoteVideo.srcObject = event.streams[0];
		remoteContainer.classList.remove('hidden');
	};

	try {
		await pc.setRemoteDescription(
			new RTCSessionDescription({ type: 'answer', sdp: newSdp }),
		);
		setMyStatus('分享中');
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

		conn.send(JSON.stringify({ type: 'offer', sdp: pc!.localDescription?.sdp }));
		setMyStatus('等待观看者(Viewer)重新连接');
	}
}

async function reconnectViewer(offerSdp: string) {
	setMyStatus('分享者已断开或重新分享，重建连接...');
	pc?.close();
	remoteVideo.srcObject = null;
	remoteContainer.classList.add('hidden');
	await startWatching(offerSdp);
}

btnShare.addEventListener('click', startBroadcasting);
btnWatch.addEventListener('click', requestWatch);
btnStop.addEventListener('click', stopRole);

const conn = new PartySocket({
	host: window.location.host,
	room: ROOM,
});

conn.addEventListener('message', async (event) => {
	try {
		const msg = JSON.parse(event.data as string);

		switch (msg.type) {
			case 'registered':
				myId = msg.id;
				setMyStatus('空闲中');
				break;

			case 'peer-list':
				if (Array.isArray(msg.peers)) {
					devices.length = 0;
					for (const p of msg.peers) {
						devices.push({ id: p.id, status: p.status, isMe: p.id === myId });
					}
					renderDeviceList();
				}
				break;

			case 'peer-joined':
				upsertDevice(msg.id, msg.status, msg.id === myId);
				break;

			case 'peer-left':
				removeDevice(msg.id);
				break;

			case 'peer-status':
				upsertDevice(msg.id, msg.status, msg.id === myId);
				break;

			case 'sharer-available':
				if (mode === 'idle') {
					btnWatch.classList.remove('hidden');
				}
				break;

			case 'sharer-left':
				if (mode === 'watching') {
					setMyStatus('分享者已离开');
					cleanup();
				} else if (mode === 'idle') {
					btnWatch.classList.add('hidden');
				}
				break;

			case 'viewer-joined':
				break;

			case 'viewer-left':
				if (mode === 'sharing') {
					await prepareNewOffer();
					setMyStatus('等待观看者(Viewer)...');
				}
				break;

			case 'offer':
				isWaitingOffer = false;
				if (typeof msg.sdp === 'string') {
					if (mode === 'watching') {
						await reconnectViewer(msg.sdp);
					} else if (mode === 'idle') {
						setMyStatus('检测到分享，连接中...');
						await startWatching(msg.sdp);
					}
				}
				break;

			case 'answer':
				if (mode === 'sharing' && typeof msg.sdp === 'string') {
					if (pc?.remoteDescription) {
						await reconnectSharer(msg.sdp);
					} else {
						try {
							await pc?.setRemoteDescription(
								new RTCSessionDescription({ type: 'answer', sdp: msg.sdp }),
							);
							setMyStatus('分享中');
						} catch {
							// stale answer, ignore
						}
					}
				}
				break;

			case 'offer-regenerating':
				setMyStatus('分享者正在重新生成连接协议，请稍候...');
				setTimeout(() => {
					if (mode === 'idle') {
						conn.send(JSON.stringify({ type: 'request-offer' }));
					}
				}, 1000);
				break;

			case 'error':
				isWaitingOffer = false;
				setMyStatus(`错误: ${msg.message}`);
				break;
		}
	} catch {
		// ignore parse errors
	}
});
