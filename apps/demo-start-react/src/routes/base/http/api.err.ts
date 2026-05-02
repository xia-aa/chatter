import { createFileRoute } from '@tanstack/react-router';

const PUT = async ({ request }: { request: Request }) => {
	return new Response(
		JSON.stringify({ error: 'This is a simulated error response' }),
		{
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		},
	);
};
export const Route = createFileRoute('/base/http/api/err')({
	server: {
		handlers: {
			PUT,
		},
	},
});
