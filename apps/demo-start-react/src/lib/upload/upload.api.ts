import { nanoid } from 'nanoid';
import { db } from '#/db.server';
import { genSignedUploadUrl } from '#/lib/upload/sdk.server';
import { genSignedUrlIn, type InsertFile } from '#/lib/upload/upload.schema';
import { file } from '#/lib/upload/upload.table';
import { sanitizeFilename } from '#/lib/upload/upload.utils';
import { authFn } from '#/orpc.base';

const _insertFile = async (data: InsertFile[]) => {
	await db.insert(file).values(data);
};

const genSignedUrls = authFn
	.input(genSignedUrlIn)
	.handler(async ({ input, context }) => {
		const { files, group = 'other' } = input;
		const basePath = `user/${context.user.id}/${group}`;
		const signedUrls = await Promise.all(
			files.map(async (file) => {
				// const id = crypto.randomUUID();
				const id = nanoid();
				const name = sanitizeFilename(file.name);
				const storageKey = `${basePath}/${id}/${name}`;
				const signedUrl = await genSignedUploadUrl(
					storageKey,
					file.type,
					file.size,
				);
				return {
					id,
					name: file.name,
					storageKey,
					signedUrl,
					type: file.type,
					size: file.size,
					uploaderId: context.user.id,
					group,
				};
			}),
		);
		await _insertFile(signedUrls);
		return signedUrls;
	});

export const uploadApi = {
	genSignedUrls,
};
