import type { BundledLanguage } from 'shiki';
import { codeToHtml } from 'shiki';

// export default function Page() {
//   return (
//     <main>
//       <CodeBlock lang="ts">
//         {['console.log("Hello")', 'console.log("World")'].join("\n")}
//       </CodeBlock>
//     </main>
//   );
// }

interface Props {
	children: string;
	lang: BundledLanguage;
}

async function CodeBlock(props: Props) {
	const out = await codeToHtml(props.children, {
		lang: props.lang,
		theme: 'github-dark',
	});

	return <div dangerouslySetInnerHTML={{ __html: out }} />;
}
