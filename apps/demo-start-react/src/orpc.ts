import { channelApi } from '#/features/channel/channel.api.ts';
import { dmMemberApi } from '#/features/channel/dmMember.api.ts';
import { dmRoomApi } from '#/features/channel/dmRoom.api.ts';
import { messageApi } from '#/features/channel/message.api.ts';
import { readStateApi } from '#/features/channel/readState.api.ts';
import { friend } from '#/features/friend/friend.api.ts';
import { friendRequest } from '#/features/friend/friendRequest.rpc.ts';
import { friendTag } from '#/features/friend/friendTag.rpc.ts';
import { orpcTodoApi } from '#/features/orpcTodo/orpcTodo.api.ts';
import { tanstackDbApi } from '#/features/tanstackDb/tanstackDb.api.ts';
import { todoApi } from '#/features/todo/todo.api';
import { profile } from '#/features/user/profile.api.ts';
import { userApi } from '#/features/user/user.api';
import { uploadApi } from '#/lib/upload/upload.api.ts';

export const orpcRouter = {
	user: userApi,
	profile,
	friendRequest,
	friend,
	friendTag,
	...orpcTodoApi,
	...todoApi,
	...tanstackDbApi,
	...uploadApi,
	channel: channelApi,
	message: messageApi,
	readState: readStateApi,
	dmRoom: dmRoomApi,
	dmMember: dmMemberApi,
} as const;
