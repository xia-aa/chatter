---
name: tanstack-db-datasource-choice
description: Decision guide for choosing between Electric SQL (real-time incremental sync) and TanStack Query (on-demand fetch) as TanStack DB data sources. Covers sync modes, network efficiency, and when to use each adapter.
---

# TanStack DB 数据源选择指南

## 核心理解

- **查询统一入口**: 所有查询通过 TanStack DB 的 `createLiveQueryCollection` 进行，与数据源无关
- **写入统一入口**: 所有写入通过 oRPC 进行，在 collection 的 `onInsert`/`onUpdate`/`onDelete` 中调用
- **数据源只影响**: 数据如何同步到客户端（拉取 vs 服务端推送）

## 两种数据源对比

| 特性 | Electric SQL | TanStack Query |
|------|-------------|----------------|
| **同步方式** | 服务端推送 (SSE Shape Stream) | 客户端拉取 (HTTP 请求) |
| **增量同步** | ✅ 只传输变更部分 (delta) | ❌ 每次全量获取 |
| **实时性** | 近实时 (服务端推送) | 取决于轮询间隔 |
| **网络效率** | 高 (只传变更) | 低 (每次全量) |
| **配置复杂度** | 高 (需要 Electric 服务 + Shape 配置) | 低 (只需要 oRPC queryOptions) |

## 决策标准

| 场景 | 推荐选择 | 理由 |
|------|---------|------|
| 需要实时更新 | **Electric** | Shape Stream 自动推送变更 |
| 数据量大、需要增量同步 | **Electric** | 只同步变更部分，节省带宽 |
| 按需加载、低频访问 | **TanStack Query** | 减少初始负载 |
| 简单 CRUD、不需要实时性 | **TanStack Query** | 配置简单 |
| 需要 Shape 过滤 (where/columns) | **Electric** | 支持服务端过滤 |

## 代码示例

### Electric 方式 (实时增量同步)

```typescript
import { electricCollectionOptions } from '@tanstack/electric-db-collection'
import { createShapeOptions } from '#/integrations/electric/utils.ts'

export const todoCollect = createCollection(
  electricCollectionOptions({
    id: 'todo',
    syncMode: 'progressive', // 或 'on-demand'
    shapeOptions: createShapeOptions('todo'),
    schema: selectTodoSchema,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const { modified } = transaction.mutations[0]
      const ret = await orpc.addTodo.call(modified)
      return { txid: ret.txid }
    },
    onUpdate: async ({ transaction }) => {
      const { modified } = transaction.mutations[0]
      const ret = await orpc.updateTodo.call(modified)
      return { txid: ret.txid }
    },
    onDelete: async ({ transaction }) => {
      const { original } = transaction.mutations[0]
      const ret = await orpc.deleteTodo.call({ id: original.id })
      return { txid: ret.txid }
    },
  }),
)
```

### TanStack Query 方式 (按需拉取)

```typescript
import { queryCollectionOptions } from '@tanstack/query-db-collection'

export const friendCollect = createCollection(
  queryCollectionOptions({
    id: 'friend',
    queryClient: getContextQC(),
    syncMode: 'on-demand',
    ...orpc.friend.select.queryOptions(),
    schema: selectFriendZ,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const { modified } = transaction.mutations[0]
      await orpc.friend.insert.call(modified)
    },
    onUpdate: async ({ transaction }) => {
      const { modified } = transaction.mutations[0]
      await orpc.friend.update.call(modified)
    },
    onDelete: async ({ transaction }) => {
      const { original } = transaction.mutations[0]
      await orpc.friend.delete.call({ id: original.id })
    },
  }),
)
```

## 查询 (两种方式通用)

```typescript
import { createLiveQueryCollection } from '@tanstack/react-db'
import { eq, and } from '@tanstack/react-db'

// 跨集合关联查询，与数据获取方式无关
const result = createLiveQueryCollection((q) =>
  q
    .from({ todo: todoCollect })
    .leftJoin({ user: userCollect }, ({ todo, user }) =>
      eq(todo.userId, user.id),
    )
    .where(({ todo }) => eq(todo.completed, false)),
)

// 获取单个结果
const userDetail = createLiveQueryCollection((q) =>
  q
    .from({ user: userCollect })
    .leftJoin({ profile: profileCollect }, ({ user, profile }) =>
      eq(user.id, profile.userId),
    )
    .where(({ user }) => eq(user.id, userId))
    .findOne(),
)
```

## 注意事项

- Electric 的 `syncMode`: `'progressive'` (初始加载后保持同步) 或 `'on-demand'` (手动触发同步)
- TanStack Query 的 `syncMode`: 通常只用 `'on-demand'`
- 两种方式的 collection 都可以通过 `collection.preload()` 在路由 loader 中预加载
- 写入操作 (`onInsert`/`onUpdate`/`onDelete`) 中都是通过 oRPC 调用服务端，与数据源无关
- Electric 的 `createShapeOptions` 封装了 url、liveSse、params 和 parser 配置
