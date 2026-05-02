import { AwsClient } from 'aws4fetch';
import { serverEnv } from '#/env.server';

const config = {
	region: 'auto',
	endpoint: serverEnv.R2_S3_ENDPOINT, // https://账户id.r2.cloudflarestorage.com
	credentials: {
		accessKeyId: serverEnv.R2_ACCESS_KEY_ID,
		secretAccessKey: serverEnv.R2_SECRET_ACCESS_KEY,
		sessionToken: serverEnv.R2_SESSION_TOKEN,
	},
};
// 初始化 AwsClient，R2 的 region 建议填 "auto"
const aws = new AwsClient({
	accessKeyId: config.credentials.accessKeyId,
	secretAccessKey: config.credentials.secretAccessKey,
	// Retrieve your S3 API credentials for your R2 bucket via API tokens (see: https://developers.cloudflare.com/r2/api/tokens)
	// sessionToken: config.credentials.sessionToken,
	service: 's3',
	region: config.region,
});
/**
 * 生成预签名 URL 的通用函数
 * aws4fetch 通过在 fetch 请求上添加 X-Amz-Expires 参数并 sign 得到签名链接
 */
async function getPresignedUrl(
	method: 'GET' | 'PUT' | 'DELETE',
	storageKey: string,
	expiresIn: number,
	queryParams: Record<string, string> = {},
	headers: Record<string, string> = {},
): Promise<string> {
	// 构建完整的 R2 终端节点 URL: https://<bucket>.<account-id>://<key>
	// 注意：env.R2_S3_ENDPOINT 通常不带 bucket，需要拼入
	const url = new URL(
		`${config.endpoint}/${serverEnv.R2_BUCKET_NAME}/${storageKey}`,
	);

	// 添加过期时间参数
	url.searchParams.set('X-Amz-Expires', expiresIn.toString());

	// 添加额外的查询参数 (如 ResponseContentDisposition)
	for (const [key, value] of Object.entries(queryParams)) {
		url.searchParams.set(key, value);
	}

	// 预签名只需 sign，不需要真正 fetch
	const signedRequest = await aws.sign(url.toString(), {
		method,
		headers,
		aws: {
			signQuery: true,
		},
	});

	return signedRequest.url;
}
/**
 * 生成R2预签名上传URL
 */
export async function genSignedUploadUrl(
	storageKey: string,
	mimeType?: string,
	fileSize?: number, // 注意：签名上传时若带了 Content-Length，客户端上传时必须一致
	expiresIn: number = 3600,
): Promise<string> {
	const headers: Record<string, string> = {};
	if (mimeType) headers['Content-Type'] = mimeType;
	if (fileSize) headers['Content-Length'] = fileSize.toString();

	try {
		return await getPresignedUrl('PUT', storageKey, expiresIn, {}, headers);
	} catch (error) {
		console.error('生成预签名URL失败:', error);
		throw new Error('生成上传链接失败');
	}
}
/**
 * 生成R2预签名下载URL (特定场景)
 */
export async function generatePresignedDownloadUrl(
	storageKey: string,
	filename?: string,
	expiresIn: number = 3600,
): Promise<string> {
	const queryParams: Record<string, string> = {};
	if (filename) {
		queryParams['response-content-disposition'] =
			`attachment; filename="${filename}"`;
	}

	try {
		return await getPresignedUrl('GET', storageKey, expiresIn, queryParams);
	} catch (error) {
		console.error('生成预签名下载URL失败:', error);
		throw new Error('生成下载链接失败');
	}
}

/**
 * 删除R2文件 (直接执行删除，不是生成链接)
 */
export async function deleteFile(key: string): Promise<void> {
	const url = `${config.endpoint}/${serverEnv.R2_BUCKET_NAME}/${key}`;
	try {
		const response = await aws.fetch(url, { method: 'DELETE' });
		if (!response.ok) {
			throw new Error(`R2 Delete failed: ${response.statusText}`);
		}
	} catch (error) {
		console.error('删除文件失败:', error);
		throw new Error('删除文件失败');
	}
}
