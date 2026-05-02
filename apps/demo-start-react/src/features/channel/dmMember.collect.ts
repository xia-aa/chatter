import { queryCollectionOptions } from '@tanstack/query-db-collection'
import {
  createCollection,
  type InferCollectionType,
} from '@tanstack/react-db'
import { getContextQC } from '#/integrations/tanstack-query/provider.ts'
import { orpc } from '#/orpc._client.ts'
import { selectDmMemberZ } from './channel.schema'

export const dmMemberCollect = createCollection(
  (queryCollectionOptions as any)({
    id: 'dm_member',
    queryClient: getContextQC(),
    syncMode: 'on-demand',
    ...orpc.dmMember.select.queryOptions(),
    schema: selectDmMemberZ,
    getKey: (item: any) => item.id as string,
    onInsert: async ({ transaction }: any) => {
      const { modified } = transaction.mutations[0]
      await orpc.dmMember.insert.call(modified as any)
    },
    onUpdate: async ({ transaction }: any) => {
      const { modified } = transaction.mutations[0]
      await orpc.dmMember.update.call(modified as any)
    },
    onDelete: async ({ transaction }: any) => {
      const { original } = transaction.mutations[0]
      await orpc.dmMember.delete.call({ id: original.id as string })
    },
  }),
)

export type DmMemberRow = InferCollectionType<typeof dmMemberCollect>
