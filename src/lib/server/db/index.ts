import { drizzle } from 'drizzle-orm/mysql2';
import { env } from '$env/dynamic/private';

export const db = drizzle(env.DATABASE_URL);
