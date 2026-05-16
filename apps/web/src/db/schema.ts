// 仅供特殊用途， 其他文件文件 不要优先从 此模块导入

export * from '#/features/channel/channel.table';
// 可订阅对象: 平台(platform,app,app本身), 用户, 项目, 团队 (关注不是订阅, 订阅是一种付费服务)
// better-auth 需要 保留原始名称, 注意此文件导出的 schema 仅给 db.server 和 better-auth 使用, 其他地方不要直接从这里导入 auth 相关的表, 应该从 #/lib/auth/auth.table.ts 导入
export {
	accountTable as account,
	apikeyTable as apikey,
	sessionTable as session,
	twoFactorTable as twoFactor,
	userTable as user,
	verificationTable as verification,
} from '#/lib/auth/auth.table.ts';
