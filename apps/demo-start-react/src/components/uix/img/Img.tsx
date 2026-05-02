import type React from 'react';

export const Img = ({ alt, ...props }: React.ComponentProps<'img'>) => {
	return <img {...props} alt={alt} />;
};
// Provisional headers are shown

// https://nextjs.org/docs/app/api-reference/components/image#fill
// fill: A boolean that causes the image to expand to the size of the parent element
// fill属性是一个布尔值，它会导致图片扩展到父元素的大小
// Positioning:
// - The parent element must assign position: `relative`, `fixed`, `absolute`
// 父元素必须设置position属性为relative、fixed、absolute
// - By default, the <img> element uses position: `absolute`
// 默认情况下，<img>元素使用position: absolute
