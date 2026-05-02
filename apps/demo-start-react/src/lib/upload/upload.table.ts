import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';
import { pgNanoid } from '#/db.helpers';
import { user } from '#/lib/auth/auth.table.ts';
import { fileGroup } from '#/lib/upload/upload.const';

// 文件存储表 - 统一管理所有上传的文件
export const file = pgTable(
	'file',
	{
		id: pgNanoid(),
		// 上传者信息
		uploaderId: text('uploader_id')
			.notNull()
			.references(() => user.id), // 保留文件记录，即使用户被删除
		// 原始文件信息
		name: varchar('name', { length: 1024 }).notNull(),
		type: text('type').notNull(), // mime_type
		size: integer('size').notNull(), // 客户端File对象大小 - 用于预签名URL限制和进度计算
		// 理论上这两个值应该相同，但在以下情况下可能出现差异：1.网络传输问题：文件损坏或传输不完整;2.客户端篡改：恶意用户可能伪造 expected_size;3.浏览器兼容性：某些老版本浏览器的 File.size 可能不准确;4.多部分上传：分片上传时的边界情况
		// actualSize: integer("actual_size"), // 文件 actual_size (字节) - 上传完成后从存储服务获取, 不需要
		// 上传状态 - 简化为三种状态
		status: text('status', { enum: ['pending', 'success', 'failed'] })
			.default('pending')
			.notNull(), // pending:等待客户端向s3<oss,r2>上传, success:上传成功, failed:上传失败
		// 存储信息
		storageKey: text('storage_key').notNull(), // 存储服务的key/path
		// storageProvider: text('storage_provider').notNull(), // local, s3, cloudflare, etc. 最后一段 是 安全 file.name

		// 文件哈希(用于完整性检查) - 上传完成后填入
		// sha1: varchar('sha1', { length: 40 }),
		// sha256: varchar('sha256', { length: 64 }),

		// 文件类型和用途
		group: text('group', { enum: fileGroup }).default('other').notNull(), // 分类\分组，如：avatar, project_icon, project_file, gallery, attachment
		// fileCategory: varchar('file_category', { length: 255 }).notNull(), // avatar, project_icon, project_file, gallery, attachment
		// filePurpose: varchar('file_purpose', { length: 255 }), // primary, additional, screenshot, etc.

		// ownerType: text("entity_type").notNull(), // project, version, user, organization, comment, etc.
		// ownerId: text("entity_id").notNull(),
		// isPrimary: boolean('is_primary').default(false).notNull(), // 是否为主要文件

		// 文件状态
		// status: text('status').default('active').notNull(), // active, deleted, quarantined
		// scanStatus: text('scan_status').default('pending').notNull(), // pending, clean, infected, error
		// scanResult: jsonb('scan_result'), // 扫描结果详情

		// 访问控制
		// visibility: text('visibility').default('public').notNull(), // public, private, restricted
		// accessToken: text('access_token'), // 私有文件的访问令牌

		// 统计信息
		// downloads: integer("download_count").default(0).notNull(),
		// viewCount: integer('view_count').default(0).notNull(),

		// 元数据
		// metadata: jsonb('metadata'), // 额外的文件元数据

		// 过期时间 (临时文件)
		// expiresAt: timestamp('expires_at'),
	},
	(table) => [
		index('file_uploader_idx').on(table.uploaderId),
		// index("file_owner_idx").on(table.ownerType, table.ownerId),
	],
);

export const download = pgTable(
	'download',
	{
		id: pgNanoid(),
		fileId: text('file_id')
			.notNull()
			.references(() => file.id, { onDelete: 'cascade' }),
		projectId: text('project_id'),
		versionId: text('version_id'),

		// 反欺诈信息
		userId: text('user_id').references(() => user.id), // 可能是匿名访问
		ip: text('ip'),
		userAgent: text('user_agent'),
		country: text('country'),
		city: text('city'),

		created_at: timestamp('created_at').defaultNow().notNull(),
	},
	(table) => [],
);

// 文件分享表 - 用于生成临时分享链接
// export const fileShare = pgTable("file_share", {
//   id: uuid('id').primaryKey().defaultRandom(),
//   file_id: uuid('file_id').notNull().references(() => file.id, { onDelete: 'cascade' }),

//   // 分享者信息
//   sharer_id: text('sharer_id').notNull().references(() => user.id, { onDelete: 'cascade' }),

//   // 分享配置
//   share_token: text('share_token').notNull().unique(), // 分享令牌
//   password: text('password'), // 可选的访问密码
//   max_downloads: integer('max_downloads'), // 最大下载次数
//   download_count: integer('download_count').default(0).notNull(),

//   // 有效期
//   expires_at: timestamp('expires_at'),

//   // 权限
//   can_preview: boolean('can_preview').default(true).notNull(),
//   can_download: boolean('can_download').default(true).notNull(),

//   // 状态
//   is_active: boolean('is_active').default(true).notNull(),

//   created_at: timestamp('created_at').$defaultFn(() => new Date()).notNull(),
// }, (table) => [
//   index("file_share_token_idx").on(table.share_token),
//   index("file_share_file_idx").on(table.file_id),
// ]);
