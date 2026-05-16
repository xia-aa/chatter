import type { ShapeStreamOptions } from '@electric-sql/client';
import { getUrlStr } from '../../env/env.url';

export const createShapeOptions = (table: string) =>
	({
		url: getUrlStr(`/api/${table}`),
		liveSse: true,
		params: { table },
		parser: {
			timestamptz: (date: string) => {
				return new Date(date);
			},
		},
	}) satisfies ShapeStreamOptions<Date>;
