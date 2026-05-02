export const to = async <T, E = Error>(
	promise: Promise<T>,
): Promise<[T, null] | [null, E]> => {
	try {
		const data = await promise;
		return [data, null];
	} catch (err) {
		return [null, err as E];
	}
};
