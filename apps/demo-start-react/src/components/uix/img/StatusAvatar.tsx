import { ClientOnly } from '@tanstack/react-router';
import { cva, type VariantProps } from 'class-variance-authority';
import { CircleMinus, Moon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { useId } from 'react';
import { twMerge } from 'tailwind-merge';
import { getImgSrc } from '#/components/uix/img/img.utils';
import { NoStyleLink } from '#/components/uix/link';
import { cn } from '#/lib/utils';
import { UxTooltip } from '../tooltip';
import type { UxAvatarProps } from './avatar';
import { UxImg } from './ServerImage';

export type OnlineStatus = 'online' | 'idle' | 'dnd' | 'invisible' | 'offline';
/**
 * 头像尺寸配置对象
 * 定义了四种尺寸（sm、md、lg、xl）的配置参数，包括：
 * - size: 头像尺寸, SVG 遮罩尺寸
 * - translate: 状态指示器的位移偏移量
 * - statusSize: 状态指示器的尺寸
 */
const sizeConfig = {
	sm: {
		size: 24,
		translate: 'translate(17, 17)',
		statusMaskX: 14,
		statusSize: 7,
	},
	md: {
		size: 32,
		translate: 'translate(22, 22)',
		statusMaskX: 19,
		statusSize: 10,
	},
	lg: {
		size: 64,
		translate: 'translate(47, 47)',
		statusMaskX: 44,
		statusSize: 14,
	},
	xl: {
		size: 80,
		translate: 'translate(60, 60)',
		statusMaskX: 57,
		statusSize: 16,
	},
};

export interface AvatarWithStatusProps extends UxAvatarProps {
	status?: OnlineStatus;
}
export function AvatarWithStatus({
	src,
	name,
	status,
	size = 'md',
	className,
}: AvatarWithStatusProps) {
	// 根据尺寸获取对应的配置参数
	const config = sizeConfig[size || 'md'];
	// 使用 React 的 useId 生成稳定 ID，避免 SSR hydration mismatch
	const uniqueId = useId();
	const maskId = `avatar-mask-${uniqueId.replace(/:/g, '')}`;
	return (
		<div
			aria-label={`${name},${status}`}
			className={cn('rounded-full', className)}
		>
			<svg
				width={config.size}
				height={config.size}
				viewBox={`0 0 ${config.size} ${config.size}`}
				aria-hidden="true"
			>
				{/* 头像遮罩定义：圆形头像 + 右下角矩形缺口 */}
				<mask id={maskId} width={config.size} height={config.size}>
					{/* 白色圆形区域：显示头像图片 */}
					<circle
						cx={config.size / 2}
						cy={config.size / 2}
						r={config.size / 2}
						fill="white"
					/>
					{/* 黑色矩形区域：挖空右下角用于放置状态指示器 */}
					<rect
						color="black"
						x={config.statusMaskX} // 19
						y={config.statusMaskX}
						width={config.statusSize + 6} // 16
						height={config.statusSize + 6}
						rx={config.size * 0.25}
						ry={config.size * 0.25}
					/>
				</mask>

				{/* 使用 foreignObject 嵌入 HTML 内容显示头像图片 */}
				<foreignObject
					x="0"
					y="0"
					width={config.size}
					height={config.size}
					mask={`url(#${maskId})`}
				>
					<div className="w-full h-full">
						<UxImg
							src={getImgSrc(src, {
								name,
								size: config.size,
							})}
							alt={name || 'avatar'}
							width={config.size}
							height={config.size}
							className="rounded-full object-cover w-full h-full"
						/>
					</div>
				</foreignObject>

				{/* 状态指示器组：通过 transform 定位到右下角 */}
				<UxTooltip content={status}>
					<g transform={` ${config.translate}`}>
						<StatusDot status={status} size={config.statusSize} />
					</g>
				</UxTooltip>
			</svg>
		</div>
	);
}
/**
 * @deprecated 请使用 AvatarWithStatus 组件
 */
export const StatusAvatar = AvatarWithStatus;

const SolidCircle = ({ color = '#45a366', size = 10 }) => (
	<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
		<circle cx={size / 2} cy={size / 2} r={size * 0.5} fill={color} />
	</svg>
);
export function StatusDot({
	status = 'offline',
	size = 10,
	className = '',
}: {
	status?: OnlineStatus;
	size?: number;
	className?: string;
}) {
	if (status === 'online') {
		return <SolidCircle size={size} />;
	} else if (status === 'dnd') {
		return (
			<CircleMinus
				color="#fb2c36"
				size={size}
				strokeWidth={size / 5}
				absoluteStrokeWidth
				className={`size-${size / 4} ${className}`}
			/>
		);
	} else if (status === 'idle') {
		return (
			<Moon
				size={size}
				color="#e5c890"
				strokeWidth={size / 5}
				absoluteStrokeWidth
				className={`size-${size / 4} ${className}`}
			/>
		);
	} else if (status === 'offline' || status === 'invisible') {
		return <SolidCircle color="#6a7282" size={size} />;
	}
}
