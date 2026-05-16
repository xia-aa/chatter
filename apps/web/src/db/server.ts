import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

// // 🟢 防止开发模式下重复创建客户端
// declare global {
// 	var __db_client__: ReturnType<typeof postgres> | undefined;
// }
// // 如果已经存在全局实例就复用，否则创建新的
// const client =
// 	global.__db_client__ ??
// 	postgres(env.DATABASE_URL, {
// 		max: 10,
// 	});
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error(`DATABASE_URL is not set`);
}
const client = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client, schema, casing: `snake_case` });

type _Db = NodePgDatabase<typeof schema>;
export type Tx = Parameters<Parameters<_Db['transaction']>[0]>[0];
export type Db = typeof db | Tx;
