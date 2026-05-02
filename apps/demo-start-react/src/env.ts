// import { createEnv } from '@t3-oss/env-core';
// import { z } from 'zod';
// import packageJson from '../package.json';

export const env = {
	VITE_APP_URL: import.meta.env.DEV
		? `http://localhost:${process.env.PORT || 3000}`
		: import.meta.env.VITE_APP_URL,

	VITE_S3_URL: import.meta.env.VITE_S3_URL,
};
// export const env = createEnv({
//   server: {
//     DATABASE_URL: z.url(),
//     BETTER_AUTH_SECRET: z.string(),
//     ELECTRIC_URL: z.url(),
//     ELECTRIC_SOURCE_ID: z.string(),
//     ELECTRIC_SECRET: z.string(),
//   },

//   /**
//    * The prefix that client-side variables must have. This is enforced both at
//    * a type-level and at runtime.
//    */
//   clientPrefix: 'VITE_',

//   client: {
//     VITE_VERSION: z.string(),
//     VITE_APP_URL: z.url(),
//     VITE_S3_URL: z.string(),
//   },

//   /**
//    * What object holds the environment variables at runtime. This is usually
//    * `process.env` or `import.meta.env`.
//    */
//   runtimeEnv: {
//     VITE_VERSION: packageJson.version,
//     VITE_APP_URL: import.meta.env.DEV
//       ? `http://localhost:${process.env.PORT || 3000}`
//       : import.meta.env.VITE_APP_URL,
//     VITE_S3_URL: import.meta.env.VITE_S3_URL,
//     // R2_S3_ENDPOINT: process.env.R2_S3_ENDPOINT,
//     DATABASE_URL: process.env.DATABASE_URL,
//     BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
//     ELECTRIC_URL: process.env.ELECTRIC_URL,
//     ELECTRIC_SOURCE_ID: process.env.ELECTRIC_SOURCE_ID,
//     ELECTRIC_SECRET: process.env.ELECTRIC_SECRET,
//   },

//   /**
//    * By default, this library will feed the environment variables directly to
//    * the Zod validator.
//    *
//    * This means that if you have an empty string for a value that is supposed
//    * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
//    * it as a type mismatch violation. Additionally, if you have an empty string
//    * for a value that is supposed to be a string with a default value (e.g.
//    * `DOMAIN=` in an ".env" file), the default value will never be applied.
//    *
//    * In order to solve these issues, we recommend that all new projects
//    * explicitly specify this option as true.
//    */
//   emptyStringAsUndefined: true,
// });
