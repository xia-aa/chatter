import { z } from 'zod';
import { getLocale } from '#/paraglide/runtime';

// param
export const idZ = z.object({ id: z.string() });
export const idOfZ = <K extends string>(name: K) =>
	z.object({ [name]: z.string() }) as unknown as z.ZodObject<{
		[P in K]: z.ZodString;
	}>;
export const uuidZ = z.object({ id: z.uuid() });

export const uuidZOf = <K extends string>(name: K) =>
	z.object({ [name]: z.uuid() }) as unknown as z.ZodObject<{
		[P in K]: z.ZodString;
	}>;

const slugUnicodeReg = /^[\w\p{L}\p{N}-]+$/u;
const SLUG_UNICODE_ERROR_MESSAGE =
	'Slug can only contain letters, numbers, dashes, underscores, and Unicode characters; slug 只能包含字母、数字、-、_和 Unicode 字符';
export const slugUnicode = z
	.string()
	.regex(slugUnicodeReg, SLUG_UNICODE_ERROR_MESSAGE);
export const slugUnicodeZ = z.object({ slug: slugUnicode });
// query

export const searchQuery = z.object({
	q: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export const listIn = z.object({
	id: z.string(),
	q: z.string().optional(),
	limit: z.number().optional().default(20),
});
export type ListIn = z.input<typeof listIn>;
export type ListOut = z.output<typeof listIn>;

export const strictJsonObjectStringZ = z.string().refine(
	(val) => {
		try {
			const parsed = JSON.parse(val);
			return typeof parsed === 'object' && parsed !== null;
		} catch {
			return false;
		}
	},
	{
		message:
			'必须是合法的 JSON 对象 字符串，不能是数组、字符串、数字、布尔或 null',
	},
);

export async function zodLocale(lang?: string) {
	if (!lang) {
		lang = getLocale();
	}
	if (lang === 'zh') {
		z.config(z.locales.zhCN());
	}
}
