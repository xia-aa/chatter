// Locale switcher refs:
// - Paraglide docs: https://inlang.com/m/gerre34r/library-inlang-paraglideJs
// - Router example: https://github.com/TanStack/router/tree/main/examples/react/i18n-paraglide#switching-locale

import { LanguagesIcon } from 'lucide-react';
import { Button } from '#/components/ui/button.tsx';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '#/components/ui/select';
import { m } from '#/paraglide/messages';
import { getLocale, locales, setLocale } from '#/paraglide/runtime';
export default function ParaglideLocaleSwitcher() {
	const currentLocale = getLocale();
	const localeNames: Record<string, string> = {
		en: m.en?.(),
		zh: m.zh?.(),
	};
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant={'icon'} size={'sm'}>
					<LanguagesIcon />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				{locales.map((locale) => (
					<DropdownMenuItem
						key={locale}
						onClick={() => setLocale(locale)}
						className={`justify-start ${locale === currentLocale && 'text-primary!'}`}
					>
						{localeNames[locale]}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
