import { type JWTPayload, jwtVerify, SignJWT } from 'jose';
import { serverEnv } from '#/env.server.ts';

const secretKey = serverEnv.BETTER_AUTH_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function jwtEncrypt(payload: JWTPayload) {
	if (!payload) return undefined;
	return new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('15minutes')
		.sign(encodedKey);
}

export async function jwtDecrypt(session?: string) {
	if (!session) return null;
	try {
		const { payload } = await jwtVerify(session, encodedKey, {
			algorithms: ['HS256'],
		});
		return payload;
	} catch (error) {
		console.log('Failed to verify session');
	}
}
