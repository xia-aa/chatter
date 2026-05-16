import { getQueryClient } from '@repo/shared/integrations/tanstack-query/provider';
import { queryCollectionOptions } from '@tanstack/query-db-collection';
import {
	BasicIndex,
	createCollection,
	createLiveQueryCollection,
	eq,
	type InferCollectionType,
	Query,
} from '@tanstack/solid-db';
import { fromTanDb } from 'agnostic-query/tanstack-db';
// 导入服务器函数
import { selectProfile } from './profile.fn';
import { profileSchema } from './profile.schema';

export const profileCollect = createCollection(
	queryCollectionOptions({
		id: 'profile',
		queryKey: ['profile'],
		queryClient: getQueryClient(),
		schema: profileSchema,
		syncMode: 'on-demand',
		queryFn: async ({ queryKey, meta, pageParam }) => {
			const data = fromTanDb(meta?.loadSubsetOptions);
			return await selectProfile({ data });
		},
		getKey: (item) => item.id,
	}),
);

export type ProfileRow = InferCollectionType<typeof profileCollect>;
