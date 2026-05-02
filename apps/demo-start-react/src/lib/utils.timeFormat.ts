import type { Locale } from 'date-fns'; // 可选：支持多语言
import {
	format,
	formatDistance,
	formatDistanceToNow,
	formatRelative,
	parseISO,
	subDays,
} from 'date-fns';
import { es, zhCN } from 'date-fns/locale';

export const formatToNow = (time?: Date | string) => {
	if (!time) return '';
	const date = typeof time === 'string' ? parseISO(time) : time;
	return formatDistanceToNow(date, {
		addSuffix: true,
		locale: zhCN,
	});
};
