// import { useMutation } from '@tanstack/react-query';
// import { ActionButton } from '#/components/uix/button/button.c';
// import { orpc } from '#/orpc._client';

// export function DataExport() {
// 	const exportData = async () => {
// 		const data = await orpc.getUserData.call();

// 		// 完整代码
// 		const blob = new Blob([JSON.stringify(data, null, 2)], {
// 			type: 'application/json',
// 		});
// 		const url = URL.createObjectURL(blob);

// 		const a = document.createElement('a');
// 		a.href = url;
// 		a.download = 'export.json';
// 		a.click();
// 		URL.revokeObjectURL(url);
// 	};
// 	return <ActionButton onClick={exportData}>导出数据</ActionButton>;
// }
