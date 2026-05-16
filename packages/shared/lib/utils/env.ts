
export const debugSsr = () => console.log(`Running on ${typeof window === 'undefined' ? 'server' : 'client'}`);