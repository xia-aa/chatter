export const clientEnv = {
 	VITE_APP_URL: import.meta.env.DEV
			? `http://localhost:${process.env.PORT || 3000}`
			: import.meta.env.VITE_APP_URL,
}