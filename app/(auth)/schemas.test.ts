import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema } from "./schemas";

const valid = {
  name: "Sam",
  email: "sam@example.com",
  password: "password123",
};

describe("signUpSchema", () => {
  it("accepts valid input", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("normalises email to trimmed lower case", () => {
    const result = signUpSchema.parse({
      ...valid,
      email: "  Sam@Example.COM ",
    });
    expect(result.email).toBe("sam@example.com");
  });

  it("trims the name and rejects a blank one", () => {
    expect(signUpSchema.parse({ ...valid, name: "  Sam " }).name).toBe("Sam");
    expect(signUpSchema.safeParse({ ...valid, name: "   " }).success).toBe(
      false,
    );
  });

  it.each([
    ["too short", "a".repeat(7)],
    ["too long", "a".repeat(129)],
  ])("rejects a password that is %s", (_, password) => {
    expect(signUpSchema.safeParse({ ...valid, password }).success).toBe(false);
  });

  it("accepts passwords at the length boundaries", () => {
    for (const password of ["a".repeat(8), "a".repeat(128)]) {
      expect(signUpSchema.safeParse({ ...valid, password }).success).toBe(true);
    }
  });

  it("rejects an invalid email", () => {
    expect(signUpSchema.safeParse({ ...valid, email: "nope" }).success).toBe(
      false,
    );
  });
});

describe("signInSchema", () => {
  it("normalises email and requires a password", () => {
    expect(
      signInSchema.parse({ email: " Sam@Example.com", password: "x" }).email,
    ).toBe("sam@example.com");
    expect(
      signInSchema.safeParse({ email: "sam@example.com", password: "" })
        .success,
    ).toBe(false);
  });
});
