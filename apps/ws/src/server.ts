import type * as Party from 'partykit/server';

interface Peer {
	id: number;
	status: string;
}

export default class Server implements Party.Server {
	sharerId: string | null = null;
	viewerId: string | null = null;
	latestOffer: string | null = null;
	regeneratingOffer = false;

	private nextId = 1;
	private peers = new Map<string, Peer>();

	constructor(readonly room: Party.Room) {}

	onConnect(conn: Party.Connection) {
		const peer: Peer = { id: this.nextId++, status: '空闲中' };
		this.peers.set(conn.id, peer);

		conn.send(JSON.stringify({ type: 'registered', id: peer.id }));
		conn.send(JSON.stringify({
			type: 'peer-list',
			peers: Array.from(this.peers.values()),
		}));

		this.room.broadcast(
			JSON.stringify({ type: 'peer-joined', id: peer.id, status: peer.status }),
			[conn.id],
		);

		if (this.latestOffer && !this.viewerId && this.sharerId) {
			const sharer = this.peers.get(this.sharerId);
			if (sharer) {
				conn.send(JSON.stringify({ type: 'sharer-available', fromId: sharer.id }));
			}
		}
	}

	onMessage(message: string, sender: Party.Connection) {
		let body: Record<string, unknown>;
		try {
			body = JSON.parse(message);
		} catch {
			sender.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
			return;
		}

		const type = body.type;
		const peer = this.peers.get(sender.id);
		if (!peer) return;

		if (type === 'status-update' && typeof body.status === 'string') {
			peer.status = body.status;
			this.room.broadcast(
				JSON.stringify({ type: 'peer-status', id: peer.id, status: peer.status }),
				[sender.id],
			);
			return;
		}

		if (type === 'offer' && typeof body.sdp === 'string') {
			if (this.sharerId && this.sharerId !== sender.id) {
				sender.send(JSON.stringify({ type: 'error', message: '已有分享者(Sharer)' }));
				return;
			}
			this.sharerId = sender.id;
			this.viewerId = null;
			this.latestOffer = body.sdp;
			this.regeneratingOffer = false;
			peer.status = '分享中';

			this.room.broadcast(JSON.stringify({ type: 'sharer-available', fromId: peer.id }), [sender.id]);
			this.room.broadcast(
				JSON.stringify({ type: 'peer-status', id: peer.id, status: '分享中' }),
				[sender.id],
			);
			return;
		}

		if (type === 'request-offer') {
			if (!this.latestOffer || !this.sharerId) {
				sender.send(JSON.stringify({ type: 'error', message: '没有分享者(Sharer)' }));
				return;
			}
			if (this.viewerId) {
				sender.send(JSON.stringify({ type: 'error', message: '已有观看者(Viewer)' }));
				return;
			}
			if (this.regeneratingOffer) {
				sender.send(JSON.stringify({ type: 'offer-regenerating' }));
				return;
			}
			this.viewerId = sender.id;
			peer.status = '观看中';

			const sharer = this.peers.get(this.sharerId);
			sender.send(JSON.stringify({ type: 'offer', sdp: this.latestOffer, fromId: sharer?.id }));

			this.room.broadcast(JSON.stringify({ type: 'viewer-joined', fromId: peer.id }), [sender.id]);
			this.room.broadcast(
				JSON.stringify({ type: 'peer-status', id: peer.id, status: '观看中' }),
				[sender.id],
			);
			return;
		}

		if (type === 'answer' && typeof body.sdp === 'string') {
			if (sender.id !== this.viewerId) {
				sender.send(JSON.stringify({ type: 'error', message: '你不是观看者(Viewer)' }));
				return;
			}
			if (this.sharerId) {
				this.room.broadcast(JSON.stringify({ type: 'answer', sdp: body.sdp }), [sender.id]);
			}
			return;
		}

		if (type === 'stop') {
			if (sender.id === this.sharerId) {
				this.sharerId = null;
				this.viewerId = null;
				this.latestOffer = null;
				peer.status = '空闲中';

				this.room.broadcast(JSON.stringify({ type: 'sharer-left', fromId: peer.id }), [sender.id]);
				this.room.broadcast(
					JSON.stringify({ type: 'peer-status', id: peer.id, status: '空闲中' }),
					[sender.id],
				);
			} else if (sender.id === this.viewerId) {
				this.viewerId = null;
				peer.status = '空闲中';

				this.regeneratingOffer = true;

				this.room.broadcast(JSON.stringify({ type: 'viewer-left', fromId: peer.id }), [sender.id]);
				this.room.broadcast(
					JSON.stringify({ type: 'peer-status', id: peer.id, status: '空闲中' }),
					[sender.id],
				);

				const sharer = this.sharerId ? this.peers.get(this.sharerId) : undefined;
				if (sharer && this.latestOffer) {
					this.room.broadcast(
						JSON.stringify({ type: 'sharer-available', fromId: sharer.id }),
						[this.sharerId!],
					);
				}
			}
			return;
		}

		sender.send(JSON.stringify({ type: 'error', message: `Unknown type: ${String(type)}` }));
	}

	onClose(conn: Party.Connection) {
		const peer = this.peers.get(conn.id);

		if (conn.id === this.sharerId) {
			this.sharerId = null;
			this.viewerId = null;
			this.latestOffer = null;
			if (peer) {
				this.room.broadcast(JSON.stringify({ type: 'sharer-left', fromId: peer.id }));
			}
		} else if (conn.id === this.viewerId) {
			this.viewerId = null;
			this.regeneratingOffer = true;
			if (peer) {
				this.room.broadcast(JSON.stringify({ type: 'viewer-left', fromId: peer.id }));
			}
			const sharer = this.sharerId ? this.peers.get(this.sharerId) : undefined;
			if (sharer && this.latestOffer) {
				this.room.broadcast(
					JSON.stringify({ type: 'sharer-available', fromId: sharer.id }),
					[this.sharerId!],
				);
			}
		}

		if (peer) {
			this.peers.delete(conn.id);
			this.room.broadcast(JSON.stringify({ type: 'peer-left', id: peer.id }));
		}
	}
}

Server satisfies Party.Worker;
