import z from 'zod';

// 64606397 -> 64.61M
// 1234 -> 1234
// 12345 -> 12.35K
// 123456 -> 1.23M
export const formatSize = (size: number): string => {
	if (size < 1000) {
		return `${size}`;
	} else if (size < 1000000) {
		return `${(size / 1000).toFixed(2)}K`;
	} else {
		return `${(size / 1000000).toFixed(2)}M`;
	}
};
export const formatBytes = (bytes: number, decimals = 2) => {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KiB', 'MiB', 'GiB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

export const numberFormatter = new Intl.NumberFormat('zh-CN', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

// slug 化, 允许 unicode 字符, ., -, _, 支持大小写, 去除 url 保留字符
export function slugifyWithUnicode(str: string): string {
	return str.replace(/[^\p{L}._-]/gu, '-').replace(/[-_]+/g, '-');
}
export const slugWithUnicodeRegex = /^[-\p{L}.][-\p{L}._-]*[-\p{L}.]?$/u;
export const slugWithUnicodeZ = z
	.string()
	.regex(slugWithUnicodeRegex, '仅允许 Unicode 字符, ., -, _');

// ^：字符串开头。
// [a-zA-Z0-9._-]：字符类，只允许字母 (a-z/A-Z)、数字 (0-9)、点 (.)、下划线 (_) 和减号 (-)。
// +：一个或多个字符。
// $：字符串结尾。
export const slugRegex = /^[a-zA-Z0-9._-]+$/;
export const slugZ = z
	.string()
	.min(1, '不能为空')
	.regex(slugRegex, '只能使用数字、字母、下划线(_), 减号(-), 和点号(.)');

export function slugify(str: string): string {
	return str.replace(/[^a-zA-Z0-9._-]/g, '-'); // 将非字母数字字符（除了 ._-）替换为连字符
}
