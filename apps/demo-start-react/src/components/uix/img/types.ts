'use client';
// https://nextjs.org/docs/app/getting-started/layouts-and-pages#creating-a-dynamic-segment

import type { LucideProps } from 'lucide-react';

import type { ForwardRefExoticComponent, JSX, RefAttributes } from 'react';

export type Icon =
	| ForwardRefExoticComponent<
			Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
	  >
	| ((props: LucideProps) => JSX.Element);
