'use client';

import type { ErrorComponentProps } from '@tanstack/react-router';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { Button } from '#/components/ui/button';
import { UxAlert } from '#/components/uix/alert';
import { Description } from '#/components/uix/label';
import { m } from '#/paraglide/messages';

export function ErrorCard({ error, reset, info }: ErrorComponentProps) {
	// const t = useTranslations();
	// useEffect(() => {
	//   // Log the error to an error reporting service
	//   console.error(error)
	// }, [error])
	return (
		<div className={'grid place-items-center  w-full h-full my-auto'}>
			<main className="bg-card rounded-md shadow-lg p-4 h-fit sm:max-w-md w-full flex flex-col gap-3">
				{/* <h2>Something went wrong!</h2> */}
				<h2>{error.name}</h2>
				<UxAlert variant={'destructive'} title={error.message} />
				原因: <Description>{String(error.cause)}</Description>
				<Description>{info?.componentStack}</Description>
				<Description>{error.stack}</Description>
				<div className="flex gap-2 mt-2 ">
					<Button variant="secondary" onClick={() => window.history.back()}>
						<ArrowLeft />
						{m.goBack()}
					</Button>
					<Button color="primary" onClick={reset}>
						<RotateCw />
						{m.tryAgain()}
					</Button>
				</div>
			</main>
		</div>
	);
}
