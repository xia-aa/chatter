import { useLocation } from '@tanstack/react-router';

export const usePathname = () =>
	useLocation({ select: (state) => state.pathname });
