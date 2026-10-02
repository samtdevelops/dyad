import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validationError } from "./action-state";

describe("validationError", () => {
  it("returns each field's messages and echoes the values back", () => {
    const schema = z.object({
      name: z.string().min(1, "Name is required"),
      age: z.number(),
    });

    const result = schema.safeParse({ name: "", age: 1 });
    if (result.success) throw new Error("expected a validation error");

    expect(validationError(result.error, { name: "" })).toEqual({
      fieldErrors: { name: ["Name is required"] },
      values: { name: "" },
    });
  });
});
