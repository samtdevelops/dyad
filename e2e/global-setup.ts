import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client } from "pg";
import { TEST_DATABASE_URL } from "./test-env";

// Runs once before the E2E suite: creates the test database if needed,
// applies migrations, and empties every table so each run starts clean.
export default async function globalSetup() {
  const url = new URL(TEST_DATABASE_URL);
  const dbName = url.pathname.slice(1);

  // Guard against ever wiping a non-test database
  if (!dbName.endsWith("_test")) {
    throw new Error(
      `Refusing to reset "${dbName}": test database names must end in _test`,
    );
  }

  await createDatabaseIfMissing(url, dbName);

  const client = new Client({ connectionString: TEST_DATABASE_URL });
  await client.connect();
  try {
    await migrate(drizzle(client), { migrationsFolder: "./drizzle" });

    // Truncate all tables (migration history lives in the "drizzle" schema)
    const { rows } = await client.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public'",
    );

    if (rows.length > 0) {
      const tables = rows.map((r) => `"public"."${r.tablename}"`).join(", ");
      await client.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
    }
  } finally {
    await client.end();
  }
}

async function createDatabaseIfMissing(url: URL, dbName: string) {
  // Connect to the default "postgres" database to run CREATE DATABASE
  const adminUrl = new URL(url);
  adminUrl.pathname = "/postgres";
  const admin = new Client({ connectionString: adminUrl.toString() });

  await admin.connect();

  try {
    const { rowCount } = await admin.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );
    if (rowCount === 0) {
      await admin.query(`CREATE DATABASE "${dbName}"`);
    }
  } finally {
    await admin.end();
  }
}
