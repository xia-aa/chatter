import { Button } from '@repo/ui/base/button';
import { createFileRoute, Link } from '@tanstack/solid-router';

export const Route = createFileRoute('/admin/')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main>
			<div class="flex gap-2 p-2">
				<Link to="/admin/sse">
					<Button>去聊天</Button>
				</Link>
				<Link to="/admin/screen-share">
					<Button>去分享屏幕</Button>
				</Link>
				<Link to="/admin/pubsub">
					<Button>去发布订阅</Button>
				</Link>
			</div>
		</main>
	);
}
