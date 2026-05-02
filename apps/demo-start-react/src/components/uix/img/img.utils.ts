// https://ui-avatars.com/api/?name=%E4%BD%A0%E5%A5%BD&size=64&background=random

import { buildFileUrl } from '#/lib/upload/upload.utils';

// `https://ui-avatars.com/api/?name=${name}&size=${size}&background=random`
export const getDefaultAvatar = (
	name: string | null = 'null',
	size = 64,
	background?: string,
) => {
	if (background) {
		return `https://ui-avatars.com/api/?name=${name}&size=${size}&background=${background}`;
	}
	return `https://ui-avatars.com/api/?name=${name}&size=${size}`;
};
export const getAvatarByVercel = (
	name: string = 'Guest',
	size = 64,
	background?: string,
) => {
	// if (background) {
	//   return `https://ui-avatars.com/api/?name=${name}&size=${size}&background=${background}`;
	// }
	return `https://avatar.vercel.sh/${name}`;
};

type ImgSrcOptions = {
	width?: number; // 高优先级
	height?: number; // 高优先级
	size?: number; // 低优先级
	name?: string | null;
};
export const getImgSrc = (src?: string | null, options?: ImgSrcOptions) => {
	if (!src) {
		return getDefaultAvatar(options?.name, options?.size);
	}
	if (src.startsWith('key://')) {
		return buildFileUrl(src.slice(6));
	} else if (
		src.startsWith('http') ||
		src.startsWith('blob:') ||
		src.startsWith('data:')
	) {
		return src;
	} else {
		return buildFileUrl(src);
	}
};
