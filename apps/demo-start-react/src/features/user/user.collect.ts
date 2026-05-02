import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import {
	BasicIndex,
	createCollection,
	createLiveQueryCollection,
	eq,
	type InferCollectionType,
	ilike,
	or,
} from '@tanstack/react-db';
import { isServer, QueryClient } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { getRouterInstance } from '@tanstack/react-start';
import { createSelectSchema } from 'drizzle-zod';
import { nanoid } from 'nanoid';
import type { z } from 'zod';
import { selectUserZ } from '#/features/user/user.schema.ts';
import { createShapeOptions } from '#/integrations/electric/utils.ts';
import { getContextQC } from '#/integrations/tanstack-query/provider.ts';
import { orpc } from '#/orpc._client.ts';
import { getRouter } from '#/router.tsx';

export const userCollect = createCollection(
	queryCollectionOptions({
		id: 'user',
		// syncMode: 'on-demand',
		...orpc.user.select.queryOptions(),
		queryClient: getContextQC(),
		// ...orpc.user.select.queryOptions(),
		// syncMode: 'progressive',
		// schema: selectUserZ,
		getKey: (item) => item.id,
		// shapeOptions: createShapeOptions('user'),
		// onInsert: async ({ transaction }) => {},
		// onUpdate: async ({ transaction }) => {},
		// onDelete: async ({ transaction }) => {},
	}),
);
export type UserRow = InferCollectionType<typeof userCollect>;

export const profileCollect = createCollection(
	queryCollectionOptions({
		id: 'profile',
		queryClient: getContextQC(),
		...orpc.profile.select.queryOptions(),
		getKey: (item) => item.id,
		syncMode: 'on-demand',
	}),
);

export const userQuery = {
	detail: (id: string) =>
		createLiveQueryCollection((q) =>
			q
				.from({ user: userCollect })
				.join({ profile: profileCollect }, ({ user, profile }) =>
					eq(user.id, profile.userId),
				)
				.where(({ user }) => eq(user.id, id))
				.findOne(),
		),
	search: (keyword: string) =>
		createLiveQueryCollection((q) =>
			q
				.from({ user: userCollect })
				.where(({ user }) =>
					or(ilike(user.name, keyword), ilike(user.displayUsername, keyword)),
				),
		),
};
