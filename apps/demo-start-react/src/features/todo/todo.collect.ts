import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import {
	BasicIndex,
	createCollection,
	type InferCollectionType,
} from '@tanstack/react-db';
import { isServer } from '@tanstack/react-query';
import { createSelectSchema } from 'drizzle-zod';
import { nanoid } from 'nanoid';
import type { z } from 'zod';
import { getUrl, getUrlStr } from '#/env.url.ts';
import { selectTodoZ } from '#/features/todo/todo.schema.ts';
import { todo } from '#/features/todo/todo.table.ts';
import { createShapeOptions } from '#/integrations/electric/utils.ts';
import { orpc } from '#/orpc._client.ts';

// 在文件顶部定义一个全局队列
// const mutationQueue = Promise.resolve();

export const todoCollect = createCollection(
	electricCollectionOptions({
		id: 'todo',
		syncMode: 'progressive',
		schema: selectTodoZ,
		getKey: (item) => item.id,
		shapeOptions: createShapeOptions('todo'),
		onInsert: async ({ transaction }) => {
			const { modified: newItem } = transaction.mutations[0];
			const ret = await orpc.addTodo.call(newItem);

			// Return txid to wait for sync
			return { txid: ret.txid };
		},
		onUpdate: async ({ transaction }) => {
			const { modified } = transaction.mutations[0];
			console.log('todoCollect.onUpdate', modified, {
				isServer: window === undefined,
			});
			const ret = await orpc.updateTodo.call({
				id: modified.id,
				title: modified.title,
				content: modified.content,
				completed: modified.completed,
			});
			return { txid: ret.txid };
		},
		onDelete: async ({ transaction }) => {
			const { original } = transaction.mutations[0];
			const ret = await orpc.deleteTodo.call({ id: original.id });
			return { txid: ret.txid };
		},
		// onInsert: async ({ transaction }) => {
		// 	// 强制排队，确保上一个请求彻底结束后再开始下一个
		// 	return mutationQueue
		// 		.then(async () => {
		// 			const {modified:newItem} = transaction.mutations[0];
		// 			const res = await orpc.addTodo.call(newItem);
		// 			return { txid: res.txid };
		// 		})
		// 		.catch((err) => {
		// 			console.error('Mutation failed', err);
		// 			throw err; // 抛出错误以防队列死掉
		// 		});
		// },

		// onUpdate: async ({ transaction }) => {
		//   const { original, changes } = transaction.mutations[0]
		//   const response = await api.todos.update({
		//     where: { id: original.id },
		//     data: changes
		//   })

		//   return { txid: response.txid }
		// }
	}),
);
export type TodoRow = InferCollectionType<typeof todoCollect>;
todoCollect.createIndex((row) => row.updated_at, { indexType: BasicIndex });
