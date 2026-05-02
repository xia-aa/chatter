import { createFileRoute } from '@tanstack/react-router';
import { eq } from 'drizzle-orm';
import { db } from '#/db.server';
import {
	prepareElectricUrl,
	proxyElectricRequest,
} from '#/integrations/electric/proxy.ts';
import { reqAuthMiddle } from '#/lib/middleware/req.ts';
import { channelTable, dmMemberTable } from '#/features/channel/channel.table';

export const Route = createFileRoute('/api/message')({
	server: {
		middleware: [reqAuthMiddle],
		handlers: {
			GET: async ({ request, context: { user } }) => {
				const originUrl = prepareElectricUrl(request.url);
				originUrl.searchParams.set('table', 'message');

				// 1. 获取用户是成员的 DM 房间 ID 列表
				const [dmRoomIds, publicChannels] = await Promise.all([
					db
						.select({ roomId: dmMemberTable.room_id })
						.from(dmMemberTable)
						.where(eq(dmMemberTable.user_id, user.id)),
					// 2. 获取所有公开频道（非私有）
					db
						.select({ id: channelTable.id })
						.from(channelTable)
						.where(eq(channelTable.is_private, false)),
				]);

				// 3. 构建 where 子句
				// - 用户自己发的消息
				// - 或用户是成员的 DM 房间的消息
				// - 或公开频道的消息
				const roomIds = dmRoomIds.map((r) => r.roomId);
				const channelIds = publicChannels.map((c) => c.id);

				const conditions = [`user_id = '${user.id}'`];

				if (roomIds.length > 0) {
					conditions.push(
						`room_id IN (${roomIds.map((id) => `'${id}'`).join(',')})`,
					);
				}
				if (channelIds.length > 0) {
					conditions.push(
						`channel_id IN (${channelIds.map((id) => `'${id}'`).join(',')})`,
					);
				}

				const filter = conditions.join(' OR ');
				originUrl.searchParams.set('where', filter);

				return proxyElectricRequest(originUrl);
			},
		},
	},
});
