import { useLiveQuery } from '@tanstack/react-db';
import { ClientOnly, createFileRoute } from '@tanstack/react-router';
import { Button } from '#/components/ui/button.tsx';
import { collectErrorCollect } from '#/routes/integration/tanstack-db/-comp/error.collection.ts';

export const Route = createFileRoute('/integration/tanstack-db/error')({
	ssr: false,
	component: RouteComponent,
});

function RouteComponent() {
	const { data, isError } = useLiveQuery((q) =>
		q.from({ collect: collectErrorCollect }),
	);
	return (
		<div>
			<div>
				{data?.map((item) => (
					<div key={item.id}>{item.id}</div>
				))}
			</div>
			<Button
				onClick={async () => {
					try {
						const tx = collectErrorCollect.insert({}); // 是乐观更新
						await tx.isPersisted.promise; // 才能捕获错误
					} catch (e) {
						console.error(e);
					}
				}}
			>
				Insert
			</Button>

			<div>{isError && 'Error'}</div>
		</div>
	);
}
