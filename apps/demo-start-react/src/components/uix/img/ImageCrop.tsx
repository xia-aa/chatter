'use client';

import {
	Check,
	Crop,
	FlipHorizontal,
	FlipVertical,
	ImageIcon,
	Move,
	Pencil,
	RotateCcw,
	RotateCw,
	Upload,
	X,
	ZoomIn,
	ZoomOut,
} from 'lucide-react';

import type * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '#/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '#/components/ui/dialog';
import { Slider } from '#/components/ui/slider';
import { Img } from '#/components/uix/img/Img';
import { cn } from '#/lib/utils';

// ============================================
// Helper: Create cropped image
// ============================================

async function getCroppedImage(
	imageSrc: string,
	cropOpt: CropOptions,
	rotation: number,
	flipH: boolean,
	flipV: boolean,
): Promise<string> {
	console.log('getCroppedImage:', cropOpt, rotation, flipH, flipV);
	const image = new Image();
	image.crossOrigin = 'anonymous';

	await new Promise((resolve, reject) => {
		image.onload = resolve;
		image.onerror = reject;
		image.src = imageSrc;
	});

	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas context not available');

	// Set canvas size to crop area
	canvas.width = cropOpt.outputWidth;
	canvas.height = cropOpt.outputHeight;

	// Apply transformations
	// 移动画布原点, 默认在 左上, x轴向右, y轴向下
	ctx.translate(canvas.width / 2, canvas.height / 2);
	ctx.rotate((rotation * Math.PI) / 180);
	ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
	ctx.translate(-canvas.width / 2, -canvas.height / 2);

	// Draw the cropped area
	// 将图片画到画布上
	ctx.drawImage(
		image,
		cropOpt.x,
		// cropOpt.x * (image.naturalWidth / cropOpt.outputWidth) +
		// canvas.width * (cropOpt.zoom - 1), // sx 图片左上角在画布上的位置
		cropOpt.y + (canvas.height / 2) * (cropOpt.zoom - 1), // sy
		image.naturalWidth / cropOpt.zoom, // sw 采样宽度
		image.naturalWidth / cropOpt.zoom, // sh
		0, // dx
		0, // dy
		canvas.width, // dw 显示宽度
		canvas.height, // dh
	);

	return canvas.toDataURL('image/webp');
}

// ============================================
// Main Component
// ============================================
interface CropOptions {
	x: number; // 裁剪区域左上角在 原图 坐标系 的 x 坐标, 0~image.naturalWidth
	y: number;
	width: number; // 裁剪区域 在 原图 坐标系 的宽度
	height: number;
	outputWidth: number; // 输出图片的宽度
	outputHeight: number; // 输出图片的高度
	zoom: number; // 预显示后 的 缩放比例
}

interface ImageCropperProps {
	src: string;
	aspectRatio?: number; // width / height, undefined = free
	shape?: 'rect' | 'circle';
	minZoom?: number;
	maxZoom?: number;
	cropSize?: number; // 裁剪框大小 (px)
	onCropComplete?: (croppedImageUrl: string) => void;
	onCancel?: () => void;
	className?: string;
}
export function ImageCropper({
	src,
	aspectRatio = 1,
	shape = 'rect',
	minZoom = 1,
	maxZoom = 2,
	cropSize = 320,
	onCropComplete,
	onCancel,
	className,
}: ImageCropperProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);

	// Transform state
	const [zoom, setZoom] = useState(1);
	const [rotation, setRotation] = useState(0);
	const [flipH, setFlipH] = useState(false);
	const [flipV, setFlipV] = useState(false);
	const [position, setPosition] = useState({ x: 0, y: 0 });

	// Drag state
	const [isDragging, setIsDragging] = useState(false);
	const dragStart = useRef({ x: 0, y: 0 });
	const positionStart = useRef({ x: 0, y: 0 });

	// Image natural dimensions
	const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

	const [containerSize, setContainerSize] = useState({
		width: 400,
		height: 300,
	});
	// 裁剪框尺寸
	const cropWidth =
		cropSize * aspectRatio > cropSize ? cropSize : cropSize * aspectRatio;
	const cropHeight =
		cropSize / aspectRatio > cropSize ? cropSize : cropSize / aspectRatio;
	const [imgSize, setImgSize] = useState({
		width: cropWidth,
		height: cropWidth,
	});
	// Container size
	// 计算图片初始缩放,使其至少覆盖裁剪区域
	const getInitialScale = useCallback(() => {
		if (!naturalSize.width || !naturalSize.height) return 1;
		const scaleX = cropWidth / naturalSize.width;
		const scaleY = cropHeight / naturalSize.height;
		// return Math.max(scaleX, scaleY) * 1.1 // 稍微大一点
		return Math.max(scaleX, scaleY);
	}, [naturalSize, cropWidth, cropHeight]);

	// 图片加载
	const handleImageLoad = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement>) => {
			const img = e.currentTarget;
			setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
			const size = {
				width:
					img.naturalWidth <= img.naturalHeight
						? cropSize
						: img.naturalWidth * (cropSize / img.naturalHeight),
				height:
					img.naturalWidth >= img.naturalHeight
						? cropSize
						: img.naturalHeight * (cropSize / img.naturalWidth),
			};
			setImgSize(size);
		},
		[cropSize],
	);
	// 初始化 zoom
	useEffect(() => {
		if (naturalSize.width && naturalSize.height) {
			const initialScale = getInitialScale();
			setZoom(Math.max(minZoom, initialScale));
		}
	}, [naturalSize, getInitialScale, minZoom]);
	// 更新容器尺寸
	useEffect(() => {
		if (containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			setContainerSize({ width: rect.width, height: rect.height });
		}
	}, []);
	// Mouse/Touch handlers for dragging
	const handlePointerDown = useCallback(
		(e: React.PointerEvent) => {
			e.preventDefault();
			setIsDragging(true);
			dragStart.current = { x: e.clientX, y: e.clientY };
			positionStart.current = { ...position };
			(e.target as HTMLElement).setPointerCapture(e.pointerId);
		},
		[position],
	);

	const handlePointerMove = useCallback(
		(e: React.PointerEvent) => {
			if (!isDragging) return;
			const dx = e.clientX - dragStart.current.x;
			const dy = e.clientY - dragStart.current.y;
			setPosition({
				x: positionStart.current.x + dx,
				y: positionStart.current.y + dy,
			});
		},
		[isDragging],
	);

	const handlePointerUp = useCallback((e: React.PointerEvent) => {
		setIsDragging(false);
		(e.target as HTMLElement).releasePointerCapture(e.pointerId);
	}, []);

	// Wheel zoom
	const handleWheel = useCallback(
		(e: React.WheelEvent) => {
			// e.preventDefault()
			const delta = e.deltaY > 0 ? -0.1 : 0.1;
			setZoom((prev) => Math.min(maxZoom, Math.max(minZoom, prev + delta)));
		},
		[minZoom, maxZoom],
	);

	// Actions
	const handleRotateLeft = () => setRotation((prev) => prev - 90);
	const handleRotateRight = () => setRotation((prev) => prev + 90);
	const handleFlipH = () => setFlipH((prev) => !prev);
	const handleFlipV = () => setFlipV((prev) => !prev);
	const handleReset = () => {
		setZoom(1);
		setRotation(0);
		setFlipH(false);
		setFlipV(false);
		setPosition({ x: 0, y: 0 });
	};

	// Complete crop
	const handleComplete = useCallback(async () => {
		if (!imageRef.current || !naturalSize.width) return;
		//  s = nw / pw; pw 为 预处理后宽度, 预处理仅为显示
		const scaleX = naturalSize.width / imgSize.width;
		const scaleY = naturalSize.height / imgSize.height;

		const cropArea: CropOptions = {
			x:
				(naturalSize.width / 2) * (1 - 1 / zoom) - (position.x * scaleX) / zoom,
			y:
				(naturalSize.height / 2) * (1 - 1 / zoom) -
				(position.y * scaleY) / zoom,
			width: naturalSize.width / zoom,
			height: naturalSize.height / zoom,
			zoom,
			outputWidth: cropWidth,
			outputHeight: cropHeight,
		};
		console.log('handleComplete:', {
			cropArea,
			position,
		});

		try {
			const croppedUrl = await getCroppedImage(
				src,
				cropArea,
				rotation,
				flipH,
				flipV,
			);
			onCropComplete?.(croppedUrl);
		} catch (error) {
			console.error('Failed to crop image:', error);
		}
	}, [
		src,
		zoom,
		rotation,
		flipH,
		flipV,
		position,
		naturalSize,
		cropWidth,
		cropHeight,
		imgSize,
		onCropComplete,
	]);
	return (
		<div
			className={cn(
				'flex flex-col gap-4 bg-background p-4 rounded-lg',
				className,
			)}
		>
			{/* Crop area */}
			<div
				ref={containerRef}
				className={cn(
					'relative overflow-hidden bg-black/90 cursor-move select-none',
				)}
				style={{
					aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
				}}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerLeave={handlePointerUp}
				onWheel={handleWheel}
			>
				{/* Image */}
				<Img
					alt="Crop preview"
					ref={imageRef}
					src={src || '/placeholder.svg'}
					onLoad={handleImageLoad}
					className="absolute top-1/2 left-1/2 max-w-none pointer-events-none object-cover"
					style={{
						transform: `
              translate(-50%, -50%)
              translate(${position.x}px, ${position.y}px)
              scale(${zoom})
              rotate(${rotation}deg)
              scaleX(${flipH ? -1 : 1})
              scaleY(${flipV ? -1 : 1})
            `,
						transformOrigin: 'center center',
					}}
					// fill
					width={imgSize.width}
					height={cropSize}
					draggable={false}
				/>
				{/* 遮罩层 - 用 SVG 实现镂空效果 */}
				<svg className="absolute inset-0 w-full h-full pointer-events-none">
					<defs>
						{/* 定义裁剪区域形状 */}
						<mask id="crop-mask">
							{/* 白色底 = 可见 */}
							<rect width="100%" height="100%" fill="white" />
							{/* 黑色裁剪框 = 镂空 */}
							{shape === 'circle' ? (
								<circle cx="50%" cy="50%" r={cropWidth / 2} fill="black" />
							) : (
								<rect
									x={`calc(50% - ${cropWidth / 2}px)`}
									y={`calc(50% - ${cropHeight / 2}px)`}
									width={cropWidth}
									height={cropHeight}
									fill="black"
								/>
							)}
						</mask>
					</defs>
					{/* 半透明遮罩 */}
					<rect
						width="100%"
						height="100%"
						fill="rgba(0, 0, 0, 0.6)"
						mask="url(#crop-mask)"
					/>
				</svg>
				{/* 裁剪框边框 */}
				<div
					className="absolute pointer-events-none border-2 border-white"
					style={{
						width: cropWidth,
						height: cropHeight,
						left: `calc(50% - ${cropWidth / 2}px)`,
						top: `calc(50% - ${cropHeight / 2}px)`,
						borderRadius: shape === 'circle' ? '50%' : '4px',
					}}
				>
					{/* 四角指示器 */}
					{shape === 'rect' && (
						<>
							<div className="absolute -left-0.5 -top-0.5 w-4 h-4 border-l-2 border-t-2 border-white" />
							<div className="absolute -right-0.5 -top-0.5 w-4 h-4 border-r-2 border-t-2 border-white" />
							<div className="absolute -left-0.5 -bottom-0.5 w-4 h-4 border-l-2 border-b-2 border-white" />
							<div className="absolute -right-0.5 -bottom-0.5 w-4 h-4 border-r-2 border-b-2 border-white" />
						</>
					)}
				</div>
				{/* Overlay grid (optional visual guide) */}
				{/* <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border border-white/30" />
          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
          <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
          <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-white/60 bg-black/40 px-2 py-1 rounded">
          <Move className="size-3" />
          <span>Drag to move</span>
        </div> */}
			</div>

			{/* Zoom slider */}
			<div className="flex items-center gap-3">
				<ZoomOut className="size-4 text-muted-foreground" />
				<Slider
					value={[zoom]}
					onValueChange={(value) =>
						setZoom(Array.isArray(value) ? value[0] : value)
					}
					min={minZoom}
					max={maxZoom}
					step={0.01}
					className="flex-1 w-full bg-red-400"
				/>
				<ZoomIn className="size-4 text-muted-foreground" />
				<span className="text-xs text-muted-foreground w-12 text-right">
					{Math.round(zoom * 100)}%
				</span>
			</div>

			{/* Transform controls */}
			<div className="flex items-center justify-center gap-1">
				<Button
					variant="ghost"
					size="icon"
					onClick={handleRotateLeft}
					title="Rotate left"
				>
					<RotateCcw className="size-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onClick={handleRotateRight}
					title="Rotate right"
				>
					<RotateCw className="size-4" />
				</Button>
				<div className="w-px h-6 bg-border mx-1" />
				<Button
					variant="ghost"
					size="icon"
					onClick={handleFlipH}
					title="Flip horizontal"
					className={cn(flipH && 'bg-accent')}
				>
					<FlipHorizontal className="size-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					onClick={handleFlipV}
					title="Flip vertical"
					className={cn(flipV && 'bg-accent')}
				>
					<FlipVertical className="size-4" />
				</Button>
				<div className="w-px h-6 bg-border mx-1" />
				<Button
					variant="ghost"
					size="sm"
					onClick={handleReset}
					className="text-xs"
				>
					Reset
				</Button>
			</div>

			{/* Action buttons */}
			<div className="flex gap-2">
				<Button
					variant="outline"
					className="flex-1 bg-transparent"
					onClick={onCancel}
				>
					<X className="size-4 mr-2" />
					Cancel
				</Button>
				<Button className="flex-1" onClick={handleComplete}>
					<Check className="size-4 mr-2" />
					Apply
				</Button>
			</div>
		</div>
	);
}

// ============================================
// Preset: Avatar Cropper
// ============================================

export function AvatarCropper(
	props: Omit<ImageCropperProps, 'aspectRatio' | 'shape'>,
) {
	return <ImageCropper {...props} aspectRatio={1} shape="circle" />;
}

// ============================================
// Preset: Banner Cropper
// ============================================

export function BannerCropper({
	ratio = '16:9',
	...props
}: Omit<ImageCropperProps, 'aspectRatio' | 'shape'> & {
	ratio?: '16:9' | '3:1' | '4:1';
}) {
	const ratioMap = {
		'16:9': 16 / 9,
		'3:1': 3,
		'4:1': 4,
	};
	return <ImageCropper {...props} aspectRatio={ratioMap[ratio]} shape="rect" />;
}

export interface ImageInputProps {
	value?: string | File | null;
	onChange?: (file: File | null) => void;
	onRemove?: () => void;
	accept?: string;
	disabled?: boolean;
	className?: string;
	/** 显示尺寸 */
	size?: 'sm' | 'md' | 'lg';
	/** 形状 */
	shape?: 'square' | 'circle';
	/** 占位图标或文字 */
	placeholder?: React.ReactNode;
	/** 是否启用裁剪编辑 */
	enableCrop?: boolean;
	/** 裁剪宽高比 */
	cropAspectRatio?: number;
}

const sizeMap = {
	sm: 'size-16',
	md: 'size-24',
	lg: 'size-32',
};

export function ImageInput({
	value,
	onChange,
	onRemove,
	accept = 'image/*',
	disabled = false,
	className,
	size = 'md',
	shape = 'square',
	placeholder,
	enableCrop = false,
	cropAspectRatio,
}: ImageInputProps) {
	const [isDragging, setDragging] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	// 裁剪相关状态
	const [cropDialogOpen, setCropDialogOpen] = useState(false);
	const [pendingFile, setPendingFile] = useState<string | null>(null);

	// 处理图片 URL
	const imageUrl = (() => {
		if (previewUrl) return previewUrl;
		if (typeof value === 'string') return value;
		if (value instanceof File) {
			const url = URL.createObjectURL(value);
			return url;
		}
		return null;
	})();

	// 处理文件选择 - 如果启用裁剪则先打开编辑器
	const handleFileSelect = useCallback(
		(file: File | null) => {
			if (!file) {
				if (previewUrl) URL.revokeObjectURL(previewUrl);
				if (pendingFile) URL.revokeObjectURL(pendingFile);
				setPreviewUrl(null);
				setPendingFile(null);
				onChange?.(null);
				return;
			}

			if (enableCrop) {
				// 启用裁剪 - 先暂存文件，打开编辑器
				const url = URL.createObjectURL(file);
				setPendingFile(url);
				setCropDialogOpen(true);
			} else {
				// 不裁剪 - 直接使用
				if (previewUrl) URL.revokeObjectURL(previewUrl);
				const url = URL.createObjectURL(file);
				setPreviewUrl(url);
				onChange?.(file);
			}
		},
		[onChange, previewUrl, pendingFile, enableCrop],
	);

	// 裁剪完成
	const handleCropComplete = useCallback(
		async (croppedImageUrl: string) => {
			// 将 base64 转为 File
			const response = await fetch(croppedImageUrl);
			const blob = await response.blob();
			const file = new File([blob], 'cropped-image.png', { type: 'image/png' });

			// 更新预览
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			setPreviewUrl(croppedImageUrl);

			// 清理暂存
			if (pendingFile) URL.revokeObjectURL(pendingFile);
			setPendingFile(null);
			setCropDialogOpen(false);

			onChange?.(file);
		},
		[onChange, previewUrl, pendingFile],
	);

	// 取消裁剪
	const handleCropCancel = useCallback(() => {
		if (pendingFile) URL.revokeObjectURL(pendingFile);
		setPendingFile(null);
		setCropDialogOpen(false);
	}, [pendingFile]);

	// 手动触发编辑（已有图片时）
	const handleEdit = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (imageUrl) {
				setPendingFile(imageUrl);
				setCropDialogOpen(true);
			}
		},
		[imageUrl],
	);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		handleFileSelect(file);
		// 重置 input 以便可以再次选择相同文件
		e.target.value = '';
	};

	const handleRemove = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		handleFileSelect(null);
		onRemove?.();
	};

	const hasImage = !!imageUrl;

	return (
		<div
			className={cn(
				'group relative overflow-hidden transition-all',
				sizeMap[size],
				shape === 'circle' ? 'rounded-full' : 'rounded-lg',
				!hasImage &&
					'bg-muted border-2 border-dashed border-muted-foreground/25',
				!hasImage && isDragging && 'border-primary bg-primary/5',
				disabled && 'opacity-50 cursor-not-allowed',
				className,
			)}
		>
			{/* 原生 input 在最上层接收事件 */}
			<input
				type="file"
				accept={accept}
				disabled={disabled}
				onChange={handleChange}
				onDragOver={(e) => e.preventDefault()}
				onDragEnter={() => setDragging(true)}
				onDragLeave={() => setDragging(false)}
				className={cn(
					'absolute inset-0 z-10 size-full cursor-pointer opacity-0',
					disabled && 'cursor-not-allowed',
				)}
			/>

			{/* 有图片时显示预览 */}
			{hasImage ? (
				<>
					<img
						src={imageUrl || '/placeholder.svg'}
						alt="Preview"
						className="size-full object-cover"
					/>
					{/* 悬停遮罩 */}
					<div
						className={cn(
							'pointer-events-none absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity',
							'group-hover:opacity-100',
						)}
					>
						<div className="rounded-full bg-white/20 p-1.5">
							<Pencil className="size-4 text-white" />
						</div>
						{enableCrop && (
							<button
								type="button"
								onClick={handleEdit}
								className="pointer-events-auto z-20 rounded-full bg-white/20 p-1.5 hover:bg-white/30"
								title="Edit image"
							>
								<Crop className="size-4 text-white" />
							</button>
						)}
					</div>
					{/* 删除按钮 - 需要在 input 上层 */}
					<button
						type="button"
						onClick={handleRemove}
						disabled={disabled}
						className={cn(
							'absolute right-1 top-1 z-20 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80',
							'group-hover:opacity-100',
							disabled && 'hidden',
						)}
					>
						<X className="size-3" />
					</button>
				</>
			) : (
				/* 无图片时显示占位 */
				<div
					className={cn(
						'pointer-events-none flex size-full flex-col items-center justify-center gap-1 text-muted-foreground transition-colors',
						isDragging && 'text-primary',
					)}
				>
					{placeholder || (
						<>
							<Upload className={cn('size-5', isDragging && 'size-6')} />
							{size !== 'sm' && <span className="text-xs">上传图片</span>}
						</>
					)}
				</div>
			)}

			{/* 裁剪编辑对话框 */}
			<Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Edit Image</DialogTitle>
					</DialogHeader>
					{pendingFile && (
						<ImageCropper
							src={pendingFile || '/placeholder.svg'}
							aspectRatio={
								cropAspectRatio ?? (shape === 'circle' ? 1 : undefined)
							}
							shape={shape === 'circle' ? 'circle' : 'rect'}
							onCropComplete={handleCropComplete}
							onCancel={handleCropCancel}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

/** 头像选择器 - 圆形预设，默认启用裁剪 */
export function AvatarInput(
	props: Omit<ImageInputProps, 'shape' | 'cropAspectRatio'>,
) {
	return (
		<ImageInput
			{...props}
			shape="circle"
			enableCrop={props.enableCrop ?? true}
			cropAspectRatio={1}
			placeholder={<ImageIcon className="size-6" />}
		/>
	);
}

/** 封面/横幅选择器 - 宽矩形预设，默认启用裁剪 */
export interface BannerInputProps
	extends Omit<ImageInputProps, 'size' | 'shape' | 'cropAspectRatio'> {
	aspectRatio?: '16/9' | '3/1' | '4/1';
}

const aspectRatioMap = {
	'16/9': 16 / 9,
	'3/1': 3,
	'4/1': 4,
};

export function BannerInput({
	aspectRatio = '16/9',
	className,
	...props
}: BannerInputProps) {
	return (
		<ImageInput
			{...props}
			className={cn(
				'w-full h-auto',
				aspectRatio === '16/9' && 'aspect-video',
				aspectRatio === '3/1' && 'aspect-[3/1]',
				aspectRatio === '4/1' && 'aspect-[4/1]',
				className,
			)}
			shape="square"
			enableCrop={props.enableCrop ?? true}
			cropAspectRatio={aspectRatioMap[aspectRatio]}
			placeholder={
				<div className="flex flex-col items-center gap-2">
					<Upload className="size-6" />
					<span className="text-sm">上传封面图</span>
				</div>
			}
		/>
	);
}
