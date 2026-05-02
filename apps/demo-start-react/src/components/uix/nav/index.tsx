import { Link } from '@tanstack/react-router';
import type { Icon } from '#/components/uix/img/types.ts';

export interface NavItem {
	value: string;
	path?: string;
	onClick?: (value: string) => void;
	icon?: Icon;
	label?: string;
	description?: string;
	badge?: string | number | null;
}
export function Nav({ items }: { items: NavItem[] }) {
	return (
		<nav>
			{items.map((item) => (
				<Link key={item.value} to={item.path} search>
					{item.label}
				</Link>
			))}
		</nav>
	);
}
