import { describe, expect, it } from 'vitest';
import { z } from 'zod/v4';
import { zodLocale } from '#/lib/utils/zod.ts';

zodLocale('zh'); // en, zh

describe('z.file() 学习', () => {
	describe('基础用法', () => {
		it('基本文件验证 - 成功', () => {
			const file = new File([], 'test.jpg');
			console.log('\n========== 基本文件验证（成功） ==========');
			console.log('输入:', file.name, file.type, file.size, 'bytes');

			const result = z.file().safeParse(file);
			console.log('success:', result.success);
			if (result.success) {
				console.log('parsed:', result.data);
				console.log('parsed type:', result.data?.constructor.name);
			}
			expect(result.success).toBe(true);
		});

		it('错误类型 - 接收错误输入', () => {
			const input = 'not a file';
			console.log('\n========== 错误类型（失败） ==========');
			console.log('输入:', input, '(type:', typeof input, ')');

			const result = z.file().safeParse(input);
			console.log('success:', result.success);

			if (!result.success) {
				console.log('\n--- error 结构 ---');
				console.log(
					'error.issues:',
					JSON.stringify(result.error.issues, null, 2),
				);
				console.log('error.issues[0].message:', result.error.issues[0].message);
				console.log('error.issues[0].code:', result.error.issues[0].code);
				console.log('error.issues[0].path:', result.error.issues[0].path);
			}

			expect(result.success).toBe(false);
		});

		it('查看 schema 结构', () => {
			const schema = z.file();
			console.log('\n========== schema 结构 ==========');
			console.log('schema:', schema);
			console.log('schema._type:', (schema as any)._type);
			console.log('schema._def:', (schema as any)._def);
		});
	});

	describe('文件大小限制 - max', () => {
		it('max 限制 - 边界测试', () => {
			const maxSize = 1024 * 1024;
			const schema = z.file().max(maxSize);

			console.log('\n========== max 限制 ==========');
			console.log('maxSize:', maxSize, 'bytes');

			// 空文件
			const emptyFile = new File([], 'empty.jpg');
			console.log('\n--- 空文件 ---');
			console.log('输入:', emptyFile.name, 'size:', emptyFile.size);
			const r1 = schema.safeParse(emptyFile);
			console.log(
				'success:',
				r1.success,
				r1.success ? '' : '→ ' + r1.error.issues[0].message,
			);

			// 小文件
			const smallContent = new Uint8Array(500_000);
			const smallFile = new File([smallContent], 'small.jpg');
			console.log('\n--- 小文件 (500KB) ---');
			console.log('输入:', smallFile.name, 'size:', smallFile.size);
			const r2 = schema.safeParse(smallFile);
			console.log(
				'success:',
				r2.success,
				r2.success ? '' : '→ ' + r2.error.issues[0].message,
			);

			// 正好 1MB
			const exactContent = new Uint8Array(1024 * 1024);
			const exactFile = new File([exactContent], 'exact.jpg');
			console.log('\n--- 正好 1MB ---');
			console.log('输入:', exactFile.name, 'size:', exactFile.size);
			const r3 = schema.safeParse(exactFile);
			console.log(
				'success:',
				r3.success,
				r3.success ? '' : '→ ' + r3.error.issues[0].message,
			);

			// 超过 1MB
			const largeContent = new Uint8Array(1024 * 1024 + 1);
			const largeFile = new File([largeContent], 'large.jpg');
			console.log('\n--- 超过 1MB ---');
			console.log('输入:', largeFile.name, 'size:', largeFile.size);
			const r4 = schema.safeParse(largeFile);
			console.log(
				'success:',
				r4.success,
				r4.success ? '' : '→ ' + r4.error.issues[0].message,
			);

			expect(r4.success).toBe(false);
		});

		it('max 限制 - 错误详情', () => {
			const maxSize = 1024 * 1024;
			const schema = z.file().max(maxSize);

			const largeContent = new Uint8Array(maxSize + 1);
			const largeFile = new File([largeContent], 'large.jpg');

			console.log('\n========== max 错误详情 ==========');
			console.log('输入:', largeFile.name, 'size:', largeFile.size);
			console.log('max:', maxSize);

			const result = schema.safeParse(largeFile);
			console.log('success:', result.success);

			if (!result.success) {
				console.log('\n--- 完整 error ---');
				console.log('issues count:', result.error.issues.length);
				result.error.issues.forEach((issue: any, i: number) => {
					console.log(`\nissue[${i}]:`);
					console.log('  code:', issue.code);
					console.log('  message:', issue.message);
					console.log('  path:', issue.path);
					console.log('  params:', issue.params);
				});
			}
		});
	});

	describe('文件大小限制 - min', () => {
		it('min 限制 - 边界测试', () => {
			const minSize = 1;
			const schema = z.file().min(minSize);

			console.log('\n========== min 限制 ==========');
			console.log('minSize:', minSize, 'bytes');

			// 空文件
			const emptyFile = new File([], 'empty.jpg');
			console.log('\n--- 空文件 (0 bytes) ---');
			console.log('输入:', emptyFile.name, 'size:', emptyFile.size);
			const r1 = schema.safeParse(emptyFile);
			console.log(
				'success:',
				r1.success,
				r1.success ? '' : '→ ' + r1.error.issues[0].message,
			);

			// 1 byte
			const tinyContent = new Uint8Array(1);
			const tinyFile = new File([tinyContent], 'tiny.jpg');
			console.log('\n--- 1 byte ---');
			console.log('输入:', tinyFile.name, 'size:', tinyFile.size);
			const r2 = schema.safeParse(tinyFile);
			console.log(
				'success:',
				r2.success,
				r2.success ? '' : '→ ' + r2.error.issues[0].message,
			);

			expect(r1.success).toBe(false);
			expect(r2.success).toBe(true);
		});
	});

	describe('MIME 类型限制', () => {
		it('mime 单类型 - 成功', () => {
			const schema = z.file().mime('image/jpeg');
			const file = new File([], 'test.jpg', { type: 'image/jpeg' });

			console.log('\n========== mime 单类型（成功） ==========');
			console.log('期望 type: image/jpeg');
			console.log('输入:', file.name, 'type:', file.type);

			const result = schema.safeParse(file);
			console.log('success:', result.success);
			console.log('parsed:', result.data);

			expect(result.success).toBe(true);
		});

		it('mime 单类型 - 失败', () => {
			const schema = z.file().mime('image/jpeg');
			const file = new File([], 'test.png', { type: 'image/png' });

			console.log('\n========== mime 单类型（失败） ==========');
			console.log('期望 type: image/jpeg');
			console.log('输入:', file.name, 'type:', file.type);

			const result = schema.safeParse(file);
			console.log('success:', result.success);
			if (!result.success) {
				console.log('error:', result.error);
			}

			expect(result.success).toBe(false);
		});

		it('mime 多类型 - 测试', () => {
			const schema = z.file().mime(['image/jpeg', 'image/png', 'image/gif']);

			console.log('\n========== mime 多类型 ==========');
			console.log('期望 types: image/jpeg, image/png, image/gif');

			const testCases = [
				{ name: 'jpg.jpg', type: 'image/jpeg', shouldPass: true },
				{ name: 'png.png', type: 'image/png', shouldPass: true },
				{ name: 'gif.gif', type: 'image/gif', shouldPass: true },
				{ name: 'webp.webp', type: 'image/webp', shouldPass: false },
				{ name: 'gif2.gif', type: 'image/gif', shouldPass: true },
			];

			testCases.forEach((tc) => {
				const file = new File([], tc.name, { type: tc.type as any });
				const r = schema.safeParse(file);
				console.log(
					`\n${tc.name} (${tc.type}): ${r.success ? '✓' : '✗ ' + r.error.issues[0].message}`,
				);
			});
		});
	});

	describe('组合限制', () => {
		it('max + mime 组合', () => {
			const schema = z.file().max(100_000).mime('image/jpeg');

			console.log('\n========== max + mime 组合 ==========');
			console.log('max: 100KB, mime: image/jpeg');

			const cases = [
				{ name: 'ok.jpg', size: 50_000, type: 'image/jpeg', ok: true },
				{
					name: 'big.jpg',
					size: 200_000,
					type: 'image/jpeg',
					ok: false,
					reason: 'too big',
				},
				{
					name: 'wrong.png',
					size: 50_000,
					type: 'image/png',
					ok: false,
					reason: 'wrong mime',
				},
			];

			cases.forEach((c) => {
				const content = new Uint8Array(c.size);
				const file = new File([content], c.name, { type: c.type as any });
				const r = schema.safeParse(file);
				const status = r.success ? '✓' : `✗ (${r.error.issues[0].message})`;
				console.log(`${c.name} (${c.size}): ${status}`);
			});
		});
	});

	describe('类型推断', () => {
		it('infer type', () => {
			const schema = z.file();
			type FileInput = z.input<typeof schema>;
			type FileOutput = z.output<typeof schema>;

			console.log('\n========== 类型推断 ==========');
			console.log('input type:', 'File | undefined');
			console.log('output type:', 'File');
		});
	});
});
