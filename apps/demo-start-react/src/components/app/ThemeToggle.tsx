import { LaptopIcon, MoonIcon, SunIcon } from 'lucide-react';
import { type Theme, useTheme } from '#/components/app/theme-provider.tsx';
import { Button } from '#/components/ui/button.tsx';

export default function ThemeToggle() {
	const { theme, setTheme, systemTheme } = useTheme();

	function toggleMode() {
		const nextTheme: Theme =
			theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
		setTheme(nextTheme);
	}

	const label =
		theme === 'system'
			? 'Theme mode: auto (system). Click to switch to light mode.'
			: `Theme mode: ${theme}. Click to switch mode.`;

	return (
		<Button
			onClick={toggleMode}
			aria-label={label}
			title={label}
			variant={'icon'}
			size={'sm'}
		>
			{theme === 'system' ? (
				<LaptopIcon />
			) : theme === 'dark' ? (
				<MoonIcon />
			) : (
				<SunIcon />
			)}
		</Button>
	);
}
