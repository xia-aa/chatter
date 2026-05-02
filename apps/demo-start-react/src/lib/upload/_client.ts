'use client';
import type { FileGroup } from '#/lib/upload/upload.const';
import { buildFileUrl } from '#/lib/upload/upload.utils';
import { orpc } from '#/orpc._client';

export const uploadFile = async (signedUrl: string, file: File) => {
	const res = await fetch(signedUrl, {
		method: 'PUT',
		headers: {
			'Content-Type': file.type,
			// 'Content-Length': file.size.toString(), // NOTE: 这里不需要设置 Content-Length，因为浏览器会忽视此头部,然后根据body自动计算并添加, https://github.com/Nahida-aa/Nahida-aa.github.io/blob/main/docs/web/http.md#request-header
		},
		body: file,
	}); //  has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. // 权限不够也可能导致响应头没有 'Access-Control-Allow-Origin'
	if (!res.ok) {
		console.error('Failed to upload file', res.status, res.statusText);
		throw new Error('Failed to upload file');
	}
};
export const uploadSingleFile = async (file: File, group?: FileGroup) => {
	const signedUrls = await orpc.genSignedUrls.call({
		files: [{ name: file.name, type: file.type, size: file.size }],
		group,
	});
	await uploadFile(signedUrls[0].signedUrl, file);
	return buildFileUrl(signedUrls[0].storageKey);
};

export const uploadFileWithProgress = (
	signedUrl: string,
	file: File,
	onProgress?: (percent: number, loaded: number, total: number) => void,
) => {
	return new Promise<void>((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.open('PUT', signedUrl);
		xhr.setRequestHeader('Content-Type', file.type);

		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable && onProgress) {
				const percent = Math.round((e.loaded / e.total) * 100);
				onProgress(percent, e.loaded, e.total);
			}
		};

		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) resolve();
			else reject(new Error(`Upload failed with status ${xhr.status}`));
		};

		xhr.onerror = () =>
			reject(new Error('Network error, no response received from server'));
		xhr.onabort = () => reject(new Error('Upload aborted'));

		xhr.send(file);
	});
};
