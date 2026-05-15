import { createFileRoute, Outlet } from '@tanstack/solid-router';
import z from 'zod';

export const Route = createFileRoute('/_auth')({
	validateSearch: z.object({
		callbackURL: z.string().default('/'),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
