import { useKeymap } from 'prosekit/react';

export const UseKeymap = ({ onKeydown }: { onKeydown?: () => void }) => {
	useKeymap({
		// 'keydown' 事件会直接调用此函数
		Enter: (state, event) => {
			// '*' 作为通配符表示拦截所有键按下事件
			console.log('Enter key pressed');
			return onKeydown?.() ?? false;
		},
	});
	return null;
};
