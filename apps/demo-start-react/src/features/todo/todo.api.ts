import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { todo } from '#/db.schema.ts';
import { db } from '#/db.server.ts';
import { addTodoZ, updateTodoZ } from '#/features/todo/todo.schema.ts';
import { generateTxId } from '#/integrations/electric/genTxid.ts';
import { authFn, Fn } from '#/orpc.base';

export const todoApi = {
	addTodo: authFn.input(addTodoZ).handler(({ input, context }) =>
		db.transaction(async (tx) => {
			const txid = await generateTxId(tx);
			const [newTodo] = await tx
				.insert(todo)
				.values({ ...input, user_id: context.user.id })
				.returning();
			return { txid, item: newTodo };
		}),
	),
	updateTodo: authFn
		.input(updateTodoZ.extend({ id: z.string() }))
		.handler(({ input, context, errors }) =>
			db.transaction(async (tx) => {
				const txid = await generateTxId(tx);
				const { id, ...updateData } = input;
				const [updatedTodo] = await tx
					.update(todo)
					.set(updateData)
					.where(and(eq(todo.id, id), eq(todo.user_id, context.user.id)))
					.returning();
				if (!updatedTodo) {
					throw errors.NOT_FOUND({ message: '你没有这个todo' });
				}
				return { txid, item: updatedTodo };
			}),
		),
	deleteTodo: authFn
		.input(z.object({ id: z.string() }))
		.handler(({ input, context, errors }) =>
			db.transaction(async (tx) => {
				const txid = await generateTxId(tx);
				const [deletedTodo] = await tx
					.delete(todo)
					.where(and(eq(todo.id, input.id), eq(todo.user_id, context.user.id)))
					.returning({ id: todo.id });
				if (!deletedTodo) {
					throw errors.NOT_FOUND({ message: '你没有这个todo' });
				}
				return { txid };
			}),
		),
};
