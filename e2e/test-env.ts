// Shared by playwright.config.ts and global-setup.ts
export const E2E_PORT = 3001;
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

// Separate database so tests never touch dev data. CI points this at its own container.
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/dyad_test";
