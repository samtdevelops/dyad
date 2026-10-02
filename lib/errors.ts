import { DrizzleQueryError } from "drizzle-orm";
import { DatabaseError } from "pg";

// Two main kinds of error in this app:
// - Expected: the user can fix it or needs to be told (a name clash, a
//   second in-progress session). lib/data throws a UserError, and the Server
//   Action catches it and returns the message as ActionState.error.
// - Unexpected: bugs, the database being down. Never caught: they reach
//   error.tsx, and Next.js logs them on the server.

// An expected failure whose message is safe to show the user as-is
export class UserError extends Error {
  name = "UserError";
}

// True when `error` is Postgres rejecting a row because of the named unique
// constraint or index. Drizzle wraps the driver's error, so check its cause.
export function isUniqueViolation(error: unknown, constraint: string) {
  const dbError = error instanceof DrizzleQueryError ? error.cause : error;
  return (
    dbError instanceof DatabaseError &&
    dbError.code === "23505" &&
    dbError.constraint === constraint
  );
}
