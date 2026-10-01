import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./auth-schema";
import { env } from "./env";

// Extend globalThis for dev-time pool reuse across Next.js HMR reloads
declare global {
  var pgPool: Pool | undefined;
}

// Single connection pool for the server process
const pool =
  globalThis.pgPool ?? new Pool({ connectionString: env.DATABASE_URL });

// Cache pool in dev only
if (env.NODE_ENV !== "production") {
  globalThis.pgPool = pool;
}

// Typed Drizzle client used by better-auth and app queries
export const db = drizzle(pool, { schema });
