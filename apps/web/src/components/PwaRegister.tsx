import { useHydrated } from '@tanstack/solid-router'
import { createEffect, onCleanup } from 'solid-js'

export default function PwaRegister() {
	const hydrated = useHydrated()
	createEffect(() => {
		if (!hydrated()) return
		if (!('serviceWorker' in navigator)) return
		if (!import.meta.env.PROD) return
		const regPromise = navigator.serviceWorker.register('/sw.js')
		onCleanup(() => {
			regPromise.then((reg) => reg.unregister())
		})
	})
	return null
}
