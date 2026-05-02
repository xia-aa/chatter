import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import MarkdownEditor from '#/components/uix/md/Editor.tsx';

export const Route = createFileRoute('/ui/display/md/')({
	component: RouteComponent,
});

function RouteComponent() {
	const [content, setContent] = useState<string>('');
	return (
		<div>
			<MarkdownEditor
				value={content}
				onChange={(value) => setContent(value || '')}
			/>
		</div>
	);
}
