import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { todo } from '#/features/todo/todo.table.ts';

export const selectTodoZ = createSelectSchema(todo, {
	id: (s) => s.default(nanoid),
	created_at: (s) => s.default(() => new Date()),
	updated_at: (s) => s.default(() => new Date()),
	completed: (s) => s.default(false), // 补充无法从drizzle-zod获取的默认值
	content: z.any().optional(), // 覆盖原类型
}).partial({
	title: true,
	content: true,
});
export const updateTodoZ = createUpdateSchema(todo).pick({
	title: true,
	content: true,
	completed: true,
});
export const addTodoZ = selectTodoZ
	.pick({
		id: true,
		title: true,
		content: true,
	})
	.partial();

export type Todo = z.infer<typeof selectTodoZ>;
