import { os } from '@orpc/server';
import { Fn } from '#/orpc.base.ts';

export const tanstackDbApi = {
	insertError: Fn.handler(async ({ errors }) => {
		throw errors.BAD_REQUEST({ message: 'Insert error' });
		// throw new Error('Insert error');
	}),
};
