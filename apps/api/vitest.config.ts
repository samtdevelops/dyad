import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["src/**/*.test.ts"],
		// Test workers are the child processes Vitest starts to run test files - run in parallel and
		// are isolated from each other. These env values are copied into each worker's process.env before
		// its tests run, such that the app uses the test database. Not applied to Vitest's main process
		// (the one `pnpm test` starts), where globalSetup runs.
		env: parseEnv(readFileSync(new URL(".env.test", import.meta.url), "utf8")),
		// Runs once in Vitest's main process, before any test worker starts.
		globalSetup: ["./src/test/global-setup.ts"],
	},
});
