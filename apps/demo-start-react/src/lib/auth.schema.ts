import { z } from 'zod';
import { slugZ } from '#/lib/utils.format';

// 手机号验证 (中国手机号)
export const phoneSchema = z
	.string()
	// .min(1, "手机号不能为空")
	.regex(/^1[3-9]\d{9}$/, '请输入有效的手机号');
export const OTPSchema = z.string().min(1, '验证码不能为空');

// 邮箱验证
const emailSchema = z.email('请输入有效的邮箱地址');
export const usernameSchema = slugZ.max(32, '不能超过32个字符');

// 密码验证
export const passwordSchema = z
	.string()
	.min(8, '密码至少需要8个字符')
	.regex(/^(?=.*[A-Za-z])(?=.*\d)/, '密码必须包含字母和数字');

// 手机号或邮箱的联合验证
export const phoneOrEmailSchema = z
	.union([phoneSchema, emailSchema], '请输入有效的手机号或邮箱地址')
	.refine(
		(value) =>
			phoneSchema.safeParse(value).success ||
			emailSchema.safeParse(value).success,
		{
			message: '请输入有效的手机号或邮箱地址',
		},
	);
// 判断是否为临时邮箱
export const isTempEmail = (email: string) => {
	// 以 @temp.com 结尾的邮箱视为临时邮箱
	return email.endsWith('@temp.com');
};
export const maskPhone = (phone: string) => {
	// 中国号：+86 + 11 位，隐藏中间 4 位 (前3 + **** + 后4)
	const chinaMatch = phone.match(/^\+86(\d{3})\d{4}(\d{4})$/);
	if (chinaMatch) {
		return `+86${chinaMatch[1]}****${chinaMatch[2]}`; // e.g., +86138****5678
	}

	// 其他国际号 fallback：隐藏中间所有数字，只留国家码 + 后4 位（更严）
	const internationalMatch = phone.match(/^(\+[0-9]{1,4})(\d{0,7})\d+(\d{4})$/);
	if (internationalMatch) {
		return `${internationalMatch[1]}****${internationalMatch[3]}`; // e.g., +1****1234 (美号)
	}

	// 默认：全隐藏中间（安全兜底）
	return phone.replace(/\d(?=.*\d{4})/g, '*'); // 留后4 位，前全 *
};
// 登录表单验证
export const loginSchema = z.object({
	phoneNumberOrEmail: phoneOrEmailSchema,
	password: passwordSchema,
});
export const PhoneNumberOTPSignInSchema = z.object({
	phoneNumber: phoneSchema,
	code: OTPSchema,
});

// 注册表单验证
export interface SignUpFormData {
	name: string;
	email: string;
	password: string;
	passwordConfirmation: string;
	image?: File;
}

export const signUpSchema = z
	.object({
		name: z.string().min(1, '用户名不能为空'),
		email: emailSchema,
		password: passwordSchema,
		passwordConfirmation: z.string().min(1, '请确认密码'),
		image: z.instanceof(File).optional(),
	})
	.refine((data) => data.password === data.passwordConfirmation, {
		message: '两次输入的密码不一致',
		path: ['passwordConfirmation'], // 将错误指向 passwordConfirmation 字段
	});

// 从 schema 推断类型，确保类型一致性
export type SignUpSchemaType = z.infer<typeof signUpSchema>;

// 验证单个字段
export const validateEmail = (value: string) => {
	const result = emailSchema.safeParse(value);
	return result.success ? null : result.error.issues[0].message;
};

export const validatePhoneOrEmail = (value: string) => {
	const result = phoneOrEmailSchema.safeParse(value);
	return result.success ? null : result.error.issues[0].message;
};

export const validatePassword = (value: string) => {
	const result = passwordSchema.safeParse(value);
	return result.success ? null : result.error.issues[0].message;
};

export const validateUsername = (value: string) => {
	const result = usernameSchema.safeParse(value);
	return result.success ? null : result.error.issues[0].message;
};

// 基于 Zod 验证结果检测输入类型
export const getInputType = (value: string): 'email' | 'phone' | 'invalid' => {
	const phoneResult = phoneSchema.safeParse(value);
	const emailResult = emailSchema.safeParse(value);

	if (emailResult.success) {
		return 'email';
	} else if (phoneResult.success) {
		return 'phone';
	} else {
		return 'invalid';
	}
};

// 扩展验证函数，返回类型信息
export const validateLoginFormWithType = (data: {
	phoneNumberOrEmail: string;
	password: string;
}) => {
	const result = loginSchema.safeParse(data);
	if (result.success) {
		const inputType = getInputType(data.phoneNumberOrEmail);
		return {
			success: true as const,
			data: result.data,
			inputType,
		};
	} else {
		return {
			success: false as const,
			errors: result.error.issues,
		};
	}
};

// 验证整个表单
export const validateLoginForm = (data: {
	phoneNumberOrEmail: string;
	password: string;
}) => {
	const result = loginSchema.safeParse(data);
	if (result.success) {
		return { success: true as const, data: result.data };
	} else {
		return { success: false as const, errors: result.error.issues };
	}
};

export type LoginFormData = z.infer<typeof loginSchema>;

// 测试函数 - 可以删除
export const testValidation = () => {
	console.log('测试无效输入:', validatePhoneOrEmail('invalid'));
	console.log('测试有效邮箱:', validatePhoneOrEmail('test@example.com'));
	console.log('测试有效手机号:', validatePhoneOrEmail('13812345678'));
};

export const getTempEmail = (phoneNumber: string) => `${phoneNumber}@temp.com`;
export const getTempName = (phoneNumber: string) => phoneNumber.slice(-4);
