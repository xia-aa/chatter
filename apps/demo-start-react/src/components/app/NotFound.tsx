import { Link } from '@tanstack/react-router';
import { GhostIcon } from 'lucide-react';
import { Button } from '#/components/ui/button';
import { m } from '#/paraglide/messages.js';

export function NotFound({ children }: { children?: React.ReactNode }) {
	return (
		<div className="p-4 flex-1">
			<div className="p-8 flex flex-col items-center justify-center gap-6 bg-white/90 dark:bg-ctp-crust rounded-xl">
				<h1 className="text-3xl font-black uppercase tracking-[-0.02em]">
					404 Not Found
				</h1>
				<GhostIcon className="size-40 opacity-20 hover:opacity-100 animate-bounce mt-8 blur-md hover:blur-none transition-all duration-300" />
				<p>{children || <p>{m.notFound_message()}</p>}</p>
				<p className="flex items-center gap-2 flex-wrap">
					<Button
						onClick={() => window.history.back()}
						className="bg-emerald-500 text-white  rounded-sm uppercase font-black text-sm"
					>
						{m.goBack()}
					</Button>

					<Link to="/" className=" rounded-sm uppercase font-black text-sm">
						<Button className="bg-cyan-600 text-white">{m.startOver()}</Button>
					</Link>
				</p>
			</div>
		</div>
	);
}
