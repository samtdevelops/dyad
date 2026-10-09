import { execSync } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import type { TestProject } from "vitest/node";
import { PrismaClient } from "../generated/prisma/client.ts";

export default async function setup(project: TestProject) {
	// This runs in Vitest's main process, where neither .env nor .env.test is loaded into
	// process.env, so read the test values from the config.
	const databaseUrl = project.config.env.DATABASE_URL;

	// Everything below uses this URL, so stop unless it's a test database.
	if (!databaseUrl || !new URL(databaseUrl).pathname.endsWith("_test")) {
		throw new Error(
			"Refusing to reset a database whose name doesn't end in _test. Check DATABASE_URL in .env.test.",
		);
	}

	execSync("prisma migrate deploy", {
		// Pass the test URL explicitly: without it, prisma.config.ts (loaded by the Prisma CLI) takes
		// DATABASE_URL from .env and migrates the dev database instead.
		env: { ...process.env, DATABASE_URL: databaseUrl },
		// Hides Prisma's output when it succeeds. If it fails, the thrown error includes that output.
		stdio: "pipe",
	});

	const prisma = new PrismaClient({
		adapter: new PrismaPg({ connectionString: databaseUrl }),
	});

	await prisma.$executeRaw`TRUNCATE "user", "session", "account", "verification"`;
	await prisma.$disconnect();
}
