export const getLocalStorage = <T>(key: string, defaultValue: T) => {
	return localStorage.getItem(key)
		? (JSON.parse(localStorage.getItem(key) || '{}') as T)
		: defaultValue;
};
