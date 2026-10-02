import { DrizzleQueryError } from "drizzle-orm";
import { DatabaseError } from "pg";
import { describe, expect, it } from "vitest";
import { isUniqueViolation } from "./errors";

function dbError(code: string, constraint?: string) {
  const error = new DatabaseError("duplicate key", 0, "error");
  error.code = code;
  error.constraint = constraint;
  return error;
}

describe("isUniqueViolation", () => {
  it("matches a unique violation on the named constraint", () => {
    expect(
      isUniqueViolation(dbError("23505", "one_in_progress"), "one_in_progress"),
    ).toBe(true);
  });

  it("looks through Drizzle's wrapper to the driver error", () => {
    const wrapped = new DrizzleQueryError(
      "insert ...",
      [],
      dbError("23505", "one_in_progress"),
    );

    expect(isUniqueViolation(wrapped, "one_in_progress")).toBe(true);
  });

  it("rejects a different constraint, a different error code, or another error", () => {
    expect(
      isUniqueViolation(dbError("23505", "other"), "one_in_progress"),
    ).toBe(false);

    expect(
      isUniqueViolation(dbError("23514", "one_in_progress"), "one_in_progress"),
    ).toBe(false);

    expect(isUniqueViolation(new Error("boom"), "one_in_progress")).toBe(false);
    
    expect(isUniqueViolation(undefined, "one_in_progress")).toBe(false);
  });
});
