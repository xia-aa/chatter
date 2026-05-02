'use client';

import { useCallback, useState } from 'react';
import { uploadFileWithProgress } from '#/lib/upload/_client';
import type { FileGroup } from '#/lib/upload/upload.const';
import { buildFileUrl } from '#/lib/upload/upload.utils';
import { to } from '#/lib/utils/fp.ts';
import { orpc } from '#/orpc._client';

interface PerFileProgress {
	[fileName: string]: { percent: number; loaded: number; total: number };
}

interface UploadStatus {
	status: 'idle' | 'uploading' | 'success' | 'error';
	progress: number; // 总进度 (0-100)
	perFileProgress: PerFileProgress; // 分文件进度
	urls?: string[]; // 成功 URL 数组
	error?: string;
}

export const useFileUpload = (group?: FileGroup) => {
	const [state, setState] = useState<UploadStatus>({
		status: 'idle',
		progress: 0,
		perFileProgress: {},
	});
	// const [toastId, setToastId] = useState<string | number | null>(null) // 新增：跟踪 toast ID

	const abortUpload = useCallback(() => {
		// 如果需取消，需改你的函数加 AbortController（xhr.abort()）
		setState((prev) => ({
			...prev,
			status: 'error',
			error: 'Upload aborted',
		}));
	}, []);
	/**
	 * @returns 文件下载 URL 数组
	 */
	const uploadFiles = useCallback(
		async (files: File[]) => {
			if (files.length === 0) return [];

			setState((prev) => ({
				...prev,
				status: 'uploading',
				perFileProgress: {},
			}));

			const perFileProgress: PerFileProgress = {};
			let totalLoaded = 0;
			const totalSize = files.reduce((sum, f) => sum + f.size, 0);

			// genSignedUrls: 1. get signed url 2. insert db
			const [signedUrlsWithMeta, err] = await to(
				orpc.genSignedUrls.call({
					files: files.map((f) => ({
						name: f.name,
						type: f.type,
						size: f.size,
					})),
					group,
				}),
			);
			if (err) {
				setState({
					status: 'error',
					progress: 0,
					perFileProgress: {},
					error: err.message,
				});
				console.log('genSignedUrls error', err);
				throw err;
			}
			const uploadPromises = files.map(async (file, index) => {
				const { signedUrl, storageKey } = signedUrlsWithMeta[index];

				// 用你的函数 + 自定义 onProgress（更新分文件 + 总进度）
				await uploadFileWithProgress(
					signedUrl,
					file,
					(percent, loaded, total) => {
						perFileProgress[file.name] = { percent, loaded, total };
						totalLoaded += loaded; // 累加总 loaded
						const overallPercent = Math.round((totalLoaded / totalSize) * 100);
						setState((prev) => ({
							...prev,
							progress: overallPercent,
							perFileProgress: { ...perFileProgress },
						}));
					},
				);

				return {
					...signedUrlsWithMeta[index],
					downloadUrl: buildFileUrl(storageKey),
				};
			});

			const results = await Promise.allSettled(uploadPromises);

			const successful = results.filter((r) => r.status === 'fulfilled');
			if (successful.length === files.length) {
				setState({
					status: 'success',
					progress: 100,
					perFileProgress: {},
					urls: successful.map((r) => r.value.downloadUrl),
				});
			} else {
				const failed = results.filter((r) => r.status === 'rejected');
				setState({
					status: 'error',
					progress: 0,
					perFileProgress: {},
					error: `${failed.map((r) => (r as PromiseRejectedResult).reason).join(', ')}`,
					//  Network error during upload
				});
			}
			return results;
		},
		[group],
	);

	return { uploadFiles, abortUpload, state }; // state 有总 progress + perFileProgress
};
