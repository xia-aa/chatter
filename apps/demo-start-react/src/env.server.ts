if (!process.env.R2_ACCESS_KEY_ID)
	throw new Error('R2_ACCESS_KEY_ID is required');
if (!process.env.R2_SECRET_ACCESS_KEY)
	throw new Error('R2_SECRET_ACCESS_KEY is required');
if (!process.env.R2_SESSION_TOKEN)
	throw new Error('R2_SESSION_TOKEN is required');
if (!process.env.R2_BUCKET_NAME) throw new Error('R2_BUCKET_NAME is required');
if (!process.env.R2_S3_ENDPOINT) throw new Error('R2_S3_ENDPOINT is required');

export const serverEnv = {
	DATABASE_URL: process.env.DATABASE_URL!,
	BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
	ELECTRIC_SOURCE_ID: process.env.ELECTRIC_SOURCE_ID!,
	ELECTRIC_SECRET: process.env.ELECTRIC_SECRET!,
	R2_S3_ENDPOINT: process.env.R2_S3_ENDPOINT,
	R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
	R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
	R2_SESSION_TOKEN: process.env.R2_SESSION_TOKEN,
	R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
};
