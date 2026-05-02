import { env } from "#/env.ts";

export const getBaseUrl = () => typeof window !== `undefined`
          ? window.location.origin
          : env.VITE_APP_URL

export const getUrl = (path: string) => new URL(path,getBaseUrl())
export const getUrlStr = (path: string) => new URL(path,getBaseUrl()).toString()
