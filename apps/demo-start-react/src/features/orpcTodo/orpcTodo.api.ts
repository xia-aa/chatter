import { os } from '@orpc/server';
import { z } from 'zod';

const todos = [
	{ id: 1, name: 'Get groceries' },
	{ id: 2, name: 'Buy a new phone' },
	{ id: 3, name: 'Finish the project' },
];

const listOrpcTodo = os
	.route({ method: 'GET' })
	.input(z.object({}))
	.handler(() => {
		return todos;
	});

const addOrpcTodo = os
	.input(z.object({ name: z.string() }))
	.handler(({ input }) => {
		const newTodo = { id: todos.length + 1, name: input.name };
		todos.push(newTodo);
		return newTodo;
	});

export const orpcTodoApi = {
	listOrpcTodo,
	addOrpcTodo,
};
