import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar';
import { Skeleton } from '#/components/ui/skeleton';
import { getImgSrc } from '#/components/uix/img/img.utils';
import { ServerImage } from '#/components/uix/img/ServerImage';
import { type AvatarVariants, avatarVariants } from '#/css';
import { cn } from '#/lib/utils.ts';

const avatarSizes = {
	sm: 6,
	md: 8,
	lg: 10,
	xl: 20,
};

export interface UxAvatarProps extends AvatarVariants {
	src?: string | null;
	name?: string | null;
	className?: string;
	onClick?: (e: React.MouseEvent) => void;
}
export const UxAvatar = ({
	src,
	name = 'null',
	size = 'md',
	className,
	onClick,
}: UxAvatarProps) => {
	const avatarSize = avatarSizes[size || 'md'];
	return (
		<Avatar
			className={cn(avatarVariants({ size }), className)}
			onClick={onClick}
		>
			<AvatarImage
				src={getImgSrc(src, {
					name,
					size: avatarSize * 4,
				})}
				className={`size-${avatarSize}`}
			/>
			<AvatarFallback>
				<Skeleton className={`size-${avatarSize} rounded-full`} />
			</AvatarFallback>
		</Avatar>
	);
};
/**
 * @deprecated Use UxAvatar instead
 */
export const XAvatar = UxAvatar;

interface GroupAvatarProps {
	images: string[];
	size?: number;
}
export const GroupAvatar: React.FC<GroupAvatarProps> = ({
	images,
	size = 48,
}) => {
	const imageSize = size / 2;

	return (
		<div
			style={{ width: size, height: size, position: 'relative' }}
			className="rounded-full overflow-hidden"
		>
			{images.slice(0, 4).map((src, index) => {
				let style = {};
				if (images.length === 2) {
					style = {
						width: size,
						height: imageSize,
						position: 'absolute',
						objectFit: 'cover',
						boxSizing: 'border-box',
						...(index === 0 && { top: 0, left: 0 }),
						...(index === 1 && { bottom: 0, left: 0 }),
					};
				} else if (images.length === 3) {
					style = {
						width: index === 0 ? imageSize : imageSize,
						height: index === 0 ? size : imageSize,
						position: 'absolute',
						objectFit: 'cover',
						boxSizing: 'border-box',
						...(index === 0 && { top: 0, left: 0 }),
						...(index === 1 && { top: 0, right: 0 }),
						...(index === 2 && { bottom: 0, right: 0 }),
					};
				} else {
					style = {
						width: imageSize,
						height: imageSize,
						position: 'absolute',
						objectFit: 'cover',
						boxSizing: 'border-box',
						...(index === 0 && { top: 0, left: 0 }),
						...(index === 1 && { top: 0, right: 0 }),
						...(index === 2 && { bottom: 0, left: 0 }),
						...(index === 3 && { bottom: 0, right: 0 }),
					};
				}
				return (
					<ServerImage
						key={index}
						src={src}
						width={imageSize}
						height={imageSize}
						alt={`avatar-${index}`}
						// style={style}
					/>
				);
			})}
		</div>
	);
};
