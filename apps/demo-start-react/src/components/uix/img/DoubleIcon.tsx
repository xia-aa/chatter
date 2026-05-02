import type React from 'react';
import { NoStyleLink } from '../link';

interface DoubleIconProps {
	primary: React.ReactNode; // 主图标
	secondary?: React.ReactNode; // 次图标，可选
	size?: number; // 默认 40 px
	href?: string;
}

export const DoubleIcon: React.FC<DoubleIconProps> = ({
	primary,
	secondary,
	size = 40,
	href,
}) => {
	const ret = (
		<div className={`relative size-${size / 4} rounded-md bg-transparent`}>
			<div className="w-full h-full [&_svg]:size-10 ">{primary}</div>
			{secondary && (
				<div className="absolute -bottom-1 -right-1 size-6 p-1 [&_svg]:size-4 bg-transparent rounded-full text-ctp-blue">
					{secondary}
				</div>
			)}
		</div>
	);
	if (href) {
		return <NoStyleLink href={href}>{ret}</NoStyleLink>;
	}
	return ret;
};
