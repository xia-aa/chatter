import {
	createCollection,
	localOnlyCollectionOptions,
} from '@tanstack/solid-db';
import { createFileRoute } from '@tanstack/solid-router';
import { z } from 'zod';

const IncomingMessageSchema = z.object({
	user: z.string(),
	text: z.string(),
});

const MessageSchema = IncomingMessageSchema.extend({
	id: z.number(),
});

export type Message = z.infer<typeof MessageSchema>;

const createMessageCollect = () =>
	createCollection(
		localOnlyCollectionOptions({
			getKey: (message) => message.id,
			schema: MessageSchema,
		}),
	);
let _collection: ReturnType<typeof createMessageCollect> | undefined;
const getMessageCollect = () => _collection || createMessageCollect();
let id = 0;
// 定义一个标志位
let isInitialized = false;

function ensureInit() {
	if (isInitialized) return;
	console.log('Initializing message collection with sample data...');
	_collection?.insert({
		id: id++,
		user: 'Alice',
		text: 'Hello, how are you?',
	});
	_collection?.insert({
		id: id++,
		user: 'Bob',
		text: "I'm fine, thank you!",
	});
	isInitialized = true;
}

const sendMessage = (message: { user: string; text: string }) => {
	_collection?.insert({
		id: id++,
		user: message.user,
		text: message.text,
	});
};
const listMessages = (request: Request) => {
	// 实例化编码器
	const encoder = new TextEncoder();
	_collection = getMessageCollect();

	ensureInit();
	// 1. 使用一個閉包變量來保存清理函數
	let cleanup: (() => void) | undefined;
	// sse 实时聊天原理, 查询 api 订阅数据库变化, 数据库变化时推送消息给客户端
	const stream = new ReadableStream({
		async start(controller) {
			// 辅助函数：安全地入队字节流
			const push = (data: any) => {
				const jsonString = `${JSON.stringify(data)}\n`;
				controller.enqueue(encoder.encode(jsonString)); // ❌ 关键修复：转换为字节
			};
			// 1. 先发送现有消息
			for (const [_id, message] of _collection?.state || []) {
				push(message);
			}
			try {
				if (!_collection) return;
				// 注意：我們需要一個變量來標記這個請求是否還活著
				let isAlive = true;

				// 2. 订阅新消息，并保存取消订阅的函数
				const subscribe = _collection.subscribeChanges((changes) => {
					if (!isAlive) return; // ⚠️ 如果請求已結束，直接跳過，不執行 I/O
					try {
						for (const change of changes) {
							if (change.type === 'insert') {
								console.log('New message:', change.value);
								push(change.value);
							}
						}
					} catch (e) {
						// 只有當寫入真的失敗時（比如客戶端已斷連），才標記為死亡
						isAlive = false;
					}
				});
				// 設置 15 分鐘主動關閉
				// await new Promise((r) => setTimeout(r, 15 * 60 * 1000));
				// maxDurationTimeout = setTimeout(() => cleanup?.(), 15 * 60 * 1000);
				// 3. 定義明確的清理邏輯
				cleanup = () => {
					// clearTimeout(maxDurationTimeout);
					subscribe.unsubscribe();
					try {
						controller.close(); // 這裡的 close 是在「出事」或「主動斷開」時才調用
					} catch (e) {}
				};

				// 3. ⚠️ 重要：当客户端断开连接时，必须取消订阅
				request.signal.addEventListener('abort', () => {
					isAlive = false;
					cleanup?.();
				});
			} catch (error) {
				console.error('Error in listMessages stream:', error);
				cleanup?.();
				controller.error(error);
			} finally {
			}
			console.log('Stream started for listMessages');
		},
		cancel(reason) {
			// 当浏览器取消流时，也执行清理
			if (cleanup) cleanup();
		},
	});

	return new Response(stream, {
		headers: {
			// 'Content-Type': 'application/x-ndjson',
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		},
	});
};

export const Route = createFileRoute('/admin/sse/chat-api')({
	server: {
		handlers: {
			GET: ({ request }) => listMessages(request),
			POST: async ({ request }) => {
				const message = IncomingMessageSchema.safeParse(await request.json());
				if (!message.success) {
					return new Response(message.error.message, { status: 400 });
				}
				sendMessage(message.data);
				return Response.json(message.data);
			},
		},
	},
});
