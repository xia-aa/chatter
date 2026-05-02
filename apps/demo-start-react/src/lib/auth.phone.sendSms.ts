// This file is auto-generated, don't edit it
// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看

// import Credential from '@alicloud/credentials';
// import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525'; // bun add @alicloud/dysmsapi20170525@4.5.0
// import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
// import * as $tea from '@alicloud/tea-typescript';
// import Util, * as $Util from '@alicloud/tea-util';

// export const createClient = () => {
// 	// 工程代码建议使用更安全的无AK方式，凭据配置方式请参见：https://help.aliyun.com/document_detail/378664.html。
// 	const credential = new Credential();
// 	const config = new $OpenApi.Config({
// 		credential: credential,
// 	});
// 	// Endpoint 请参考 https://api.aliyun.com/product/Dysmsapi
// 	config.endpoint = `dysmsapi.aliyuncs.com`;
// 	return new Dysmsapi20170525(config);
// };
export const sendSms = async (
	phoneNumber: string,
	code: string,
): Promise<void> => {
	// const client = createClient();
	// const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
	// 	templateCode: 'SMS_498460077',
	// 	templateParam: `{"code":${code}}`,
	// 	signName: 'aaChat',
	// 	phoneNumbers: phoneNumber,
	// });
	// const runtime = new $Util.RuntimeOptions({});
	// try {
	// 	// 复制代码运行请自行打印 API 的返回值
	// 	await client.sendSmsWithOptions(sendSmsRequest, runtime);
	// } catch (error: any) {
	// 	// 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
	// 	// 错误 message
	// 	console.log(error.message);
	// 	// 诊断地址
	// 	console.log(error.data['Recommend']);
	// 	throw error;
	// }
};
