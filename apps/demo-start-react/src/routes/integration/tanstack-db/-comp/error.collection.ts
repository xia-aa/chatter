import {
	createCollection,
	localOnlyCollectionOptions,
} from '@tanstack/react-db';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { orpc } from '#/orpc._client.ts';

export const collectErrorCollect = createCollection(
	localOnlyCollectionOptions({
		schema: z.object({
			id: z.string().default(nanoid),
		}),
		getKey: (item) => item.id,
		onInsert: async ({ transaction }) => {
			await orpc.insertError.call();
		},
	}),
);
