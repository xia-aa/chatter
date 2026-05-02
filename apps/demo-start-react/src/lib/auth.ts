import { i18n } from '@better-auth/i18n';
import { passkey } from '@better-auth/passkey';
import { type BetterAuthOptions, betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
	admin,
	anonymous,
	customSession,
	emailOTP,
	openAPI,
	// organization,
	phoneNumber,
	twoFactor,
	username,
} from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import * as schema from '#/db.schema'; // Import the schema object
import { db } from '#/db.server';
import { env } from '#/env';
import { jwtEncrypt } from '#/lib/auth.jwt';
import { sendSms } from '#/lib/auth.phone.sendSms';
import { getTempEmail, getTempName } from '#/lib/auth.schema';

const options = {
	plugins: [
		tanstackStartCookies(),
		i18n({
			translations: {
				// https://better-auth.com/docs/reference/errors
				zh: {
					USER_NOT_FOUND: '用户未找到',
					INVALID_EMAIL_OR_PASSWORD: '无效的电子邮件地址或密码',
					INVALID_PASSWORD: '密码无效',
					CREDENTIAL_ACCOUNT_NOT_FOUND: '未找到凭据帐户',
					EMAIL_NOT_VERIFIED: '电子邮件未验证',
					SESSION_EXPIRED: '会话已过期',
				},
				fr: {
					USER_NOT_FOUND: 'Utilisateur non trouvé',
					INVALID_EMAIL_OR_PASSWORD: 'Email ou mot de passe invalide',
					INVALID_PASSWORD: 'Mot de passe invalide',
				},
				de: {
					USER_NOT_FOUND: 'Benutzer nicht gefunden',
					INVALID_EMAIL_OR_PASSWORD: 'Ungültige E-Mail oder Passwort',
					INVALID_PASSWORD: 'Ungültiges Passwort',
				},
			},
			detection: ['cookie', 'header', 'session'], // Priority order
		}),
		twoFactor(), // 2FA: 即验证两次,且使用不同因素,开发初期不用考虑,
		anonymous(), // user.isAnonymous: boolean
		// add: twoFactor: Table, user.twoFactorEnabled: boolean,
		username({
			minUsernameLength: 1, // 最小用户名长度, default 3
			// maxUsernameLength: 20, // 最大用户名长度, default 30
			usernameValidator: (username) => {
				// 默认在 规范化前运行
				// 允许中文
				const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/; // 中文、字母、数字、下划线
				return usernameRegex.test(username);
			},
			usernameNormalization: false, // 是否规范化用户名（如转换为小写）, default true
		}),
		// username(),
		// add: user.username: unique; user.displayUsername: text

		phoneNumber({
			sendOTP: async ({ phoneNumber, code }, request) => {
				console.log(`发送验证码: ${phoneNumber}, ${code}`);
				if (process.env.NODE_ENV === 'development') {
					// 假设 等待 5 秒发送验证码
					await new Promise((resolve) => setTimeout(resolve, 5000));
					console.log(code);
					// throw new Error('开发环境')
					return;
				}

				await sendSms(phoneNumber, code);
			},
			sendPasswordResetOTP: async ({ phoneNumber, code }, request) => {
				console.log(`发送重置密码请求验证码: ${phoneNumber}, ${code}`);
				if (process.env.NODE_ENV === 'development') return;
				await sendSms(phoneNumber, code);
			},
			signUpOnVerification: {
				getTempEmail,
				getTempName,
			},
		}), // add: user.phoneNumber: text,unique; user.phoneNumberVerified: boolean
		// nodemailer TODO: 实现邮件发送
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				if (type === 'sign-in') {
					// Send the OTP for sign in
				} else if (type === 'email-verification') {
					// Send the OTP for email verification
				} else {
					// Send the OTP for password reset
				}
				if (process.env.NODE_ENV === 'development') {
					// 开发环境：控制台输出
					console.log(`🔥 开发模式 - 邮箱验证码`);
					console.log(`📧 邮箱: ${email}`);
					console.log(`🔢 验证码: ${otp}`);
					console.log(`📋 类型: ${type}`);
					console.log(`⏰ 有效期: 5分钟`);
					console.log(`----------------------------------------`);
					return;
				}

				// 生产环境：实现真实的邮件发送
				// TODO: 集成邮件服务（如 Nodemailer、SendGrid 等）
				console.warn('生产环境邮件服务未配置');
				throw new Error('邮件服务暂不可用');
			},
		}),
		admin(),
		// organization({
		//   schema: {
		//     organization: {
		//       additionalFields: {
		//         // better-auth 1.3, @latest
		//         summary: {
		//           type: 'string',
		//           input: true,
		//           required: false,
		//         },
		//         description: {
		//           type: 'string',
		//           input: true,
		//           required: false,
		//         },
		//       },
		//     },
		//   },
		// }),
		passkey(),
		openAPI(), // basePath/reference: open-api doc
	],
	baseURL: env.VITE_APP_URL,
	advanced: {
		cookiePrefix: 'mcc',
	},
	session: {
		expiresIn: 60 * 60 * 24 * 30, // 30 days
		updateAge: 60 * 60 * 24 * 2, // 1 day (every 2 day the session expiration is updated)
		// https://www.better-auth.com/docs/concepts/session-management#cookie-cache
		// 使用 类似 jwt 的机制将 session 缓存到 cookie 中, 避免一次请求多次查询数据库(可以用react.cache 进行缓存, 但对于非 jsx 渲染的 部分 不适用, 例如 ws 接口)
		cookieCache: {
			enabled: true,
			maxAge: 15 * 60, // Cache duration in seconds (15 minutes)
			strategy: 'jwt', // can be "compact" or "jwt" or "jwe"
			// refreshCache: true, // Enable stateless refresh
			// refreshCache: {
			//   updateAge: 60, // Refresh when 60 seconds remain before expiry
			// },
		},
	},
	account: {
		storeStateStrategy: 'cookie',
		storeAccountCookie: true, // Store account data after OAuth flow in a cookie (useful for database-less flows)
	},
	rateLimit: {
		enabled: true, // 开发环境下也开启限制
		window: 60, // time window in seconds
		max: 100, // max requests in the window
		customRules: {
			'/phone-number/send-otp': {
				window: 45,
				max: 1,
			},
			// "/sign-in/email": {
			//   window: 10,
			//   max: 3,
			// },
			// "/two-factor/*": async (request) => {
			//   // custom function to return rate limit window and max
			//   return {
			//     window: 10,
			//     max: 3,
			//   };
			// },
		},
	},
	database: drizzleAdapter(db, {
		provider: 'pg', // or "mysql", "sqlite"
		// schema: {
		//   // ...schema,
		//   user: schema.user,
		// },
		schema: schema,
	}),
	experimental: { joins: true },
	user: {
		additionalFields: {
			realNameVerified: {
				type: 'boolean',
				defaultValue: false,
				required: false,
				input: false, // don't allow user to set
			},
			eduVerified: {
				type: 'boolean',
				defaultValue: false,
				required: false,
				input: false,
			},
			// summary: {
			//   type: 'string',
			//   required: false,
			// },
			// description: {
			//   type: 'string',
			//   required: false,
			// },
			// // 生日
			// birthday: {
			//   type: 'date',
			//   required: false,
			// },
			// personalizedRecommendation: {
			//   type: 'boolean',
			//   defaultValue: false,
			// },
			// color: {
			//   type: 'string',
			//   required: false,
			// },
			// banner: {
			//   type: 'string',
			//   required: false,
			// },
		},
		deleteUser: {
			enabled: true,
		},
	},
	trustedOrigins: [
		'http://localhost:3000',
		'http://localhost:3001',
		'http://localhost:3002',
		'http://localhost:3003',
		'http://localhost:3333',
		'https://xn--2qqt0eizbxcx84dyq3c.cn',
	],
	emailAndPassword: {
		enabled: true,
	},
} satisfies BetterAuthOptions;
export const auth = betterAuth({
	...options,
	plugins: [
		...(options.plugins ?? []),
		customSession(async ({ user, session }) => {
			return {
				user,
				session,
				token: await jwtEncrypt({ userId: user.id }),
			};
		}, options),
	],
});

export type AuthUser = typeof auth.$Infer.Session.user & { username: string };
export type AuthSession = {
	user: AuthUser;
	session: typeof auth.$Infer.Session.session;
	token: typeof auth.$Infer.Session.token;
};
