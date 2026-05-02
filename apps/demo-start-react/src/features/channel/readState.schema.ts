import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { readStateTable } from './channel.table';

// 查询 schema（自动从表派生）
export const selectReadStateZ = createSelectSchema(readStateTable);
export type SelectReadState = z.infer<typeof selectReadStateZ>;

// 插入 schema（自动从表派生）
export const insertReadStateZ = createInsertSchema(readStateTable);
export type InsertReadState = z.infer<typeof insertReadStateZ>;

// 插入/更新 schema（从表派生，选取所需字段）
export const upsertReadStateIn = createInsertSchema(readStateTable).pick({
	user_id: true,
	target_type: true,
	target_id: true,
	last_read_message_id: true,
});
export type UpsertReadStateIn = z.input<typeof upsertReadStateIn>;

// 删除 schema（API 输入用 camelCase，与项目其他 API 保持一致）
export const deleteReadStateIn = z.object({
	userId: z.string(),
	targetType: z.enum(['channel', 'dm_room']),
	targetId: z.string(),
});
export type DeleteReadStateIn = z.input<typeof deleteReadStateIn>;
