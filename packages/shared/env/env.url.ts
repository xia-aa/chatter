import { clientEnv } from "./env._client";

export const getBaseUrl = () =>
	typeof window !== `undefined` ? window.location.origin : clientEnv.VITE_APP_URL;

export const getUrl = (path: string) => new URL(path, getBaseUrl());
export const getUrlStr = (path: string) =>
	new URL(path, getBaseUrl()).toString();
export const getApiUrlStr = (path: string) =>
	new URL(`/api/${path}`, getBaseUrl()).toString();
