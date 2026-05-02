import z from 'zod';
import {
	type AcceptItem,
	type FileShow,
	fileGroup,
	imageMimes,
} from '#/lib/upload/upload.const';
import type { file } from '#/lib/upload/upload.table';

const _validFileType = (file: File, type: string) => {
	if (type.endsWith('/*')) {
		return file.type.startsWith(type.replace('/*', ''));
	}
	return file.type === type || file.name.endsWith(type);
};
export const validateFileType = (
	item: FieldFileItem | File,
	accept?: string | AcceptItem[],
): boolean => {
	if (!accept) return true;

	const accepted = Array.isArray(accept)
		? accept
		: accept.split(',').map((t) => t.trim());

	return accepted.some((type) => {
		if (item instanceof File) {
			return _validFileType(item, type);
		} else if (item.file) {
			return _validFileType(item.file, type);
		} else {
			const ext = item.url.split('.').pop();
			return ext && accepted.includes(ext);
		}
	});
};

export const fieldFileItemZ = z.object({
	id: z.string().optional(),
	url: z.string(),
	file: z.file().max(1_000_000).optional(),
});
export type FieldFileItem = z.infer<typeof fieldFileItemZ>;
export type FieldFileChange = {
	file: File;
	url: string;
};
export const fieldImageItemZ = fieldFileItemZ.extend({
	file: z
		.file()
		.max(10_000_000, '文件大小不能超过10MB')
		.mime([...imageMimes], '仅支持图片')
		.optional(),
});

// 生成预签名URL的请求 schema
export const genSignedUrlFile = z.object({
	name: z.string().min(1, '文件名不能为空').max(255, '文件名过长'),
	type: z.string().min(1, '文件类型不能为空'),
	size: z
		.number()
		.min(1, '文件大小必须大于0')
		.max(100 * 1024 * 1024, '文件大小不能超过100MB'), // 100MB限制
});
export const genSignedUrlIn = z.object({
	files: genSignedUrlFile.array().min(1, '至少需要一个文件'),
	group: z.enum(fileGroup).default('other').optional(),
});
export type InsertFile = typeof file.$inferInsert;
