import { afterAll, describe, expect, test } from "vitest";
import { z } from "zod";
import { buildApp } from "./app.ts";
import { HttpError } from "./errors.ts";

const app = buildApp();
afterAll(() => app.close());

app.get("/test/http-error", () => {
	throw new HttpError(409, "NAME_TAKEN", "That name is taken");
});
app.post(
	"/test/validated",
	{ schema: { body: z.object({ email: z.email() }) } },
	() => ({ ok: true }),
);
app.get("/test/crash", () => {
	throw new Error("connect ECONNREFUSED 10.0.0.5:5432");
});
app.get("/test/non-string-code", () => {
	throw Object.assign(new Error("Bad input"), { statusCode: 400, code: 123 });
});

describe("error responses", () => {
	test("unknown routes return 404 in our error shape", async () => {
		const response = await app.inject({ url: "/api/does-not-exist" });

		expect(response.statusCode).toBe(404);
		expect(response.json()).toEqual({
			error: {
				code: "NOT_FOUND",
				message: "Route GET /api/does-not-exist not found",
			},
		});
	});

	test("HttpError keeps its status, code and message", async () => {
		const response = await app.inject({ url: "/test/http-error" });

		expect(response.statusCode).toBe(409);
		expect(response.json()).toEqual({
			error: { code: "NAME_TAKEN", message: "That name is taken" },
		});
	});

	test("schema validation failures return 400 in our error shape", async () => {
		const response = await app.inject({
			method: "POST",
			url: "/test/validated",
			payload: { email: "not-an-email" },
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: { code: "FST_ERR_VALIDATION", message: expect.any(String) },
		});
	});

	test("malformed JSON returns 400 in our error shape", async () => {
		const response = await app.inject({
			method: "POST",
			url: "/test/validated",
			headers: { "content-type": "application/json" },
			payload: "{not json",
		});

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: {
				code: "FST_ERR_CTP_INVALID_JSON_BODY",
				message: expect.any(String),
			},
		});
	});

	test("unexpected errors return a generic 500 without leaking the message", async () => {
		const response = await app.inject({ url: "/test/crash" });

		expect(response.statusCode).toBe(500);
		expect(response.json()).toEqual({
			error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" },
		});
		expect(response.body).not.toContain("ECONNREFUSED");
	});

	test("client errors without a string code fall back to BAD_REQUEST", async () => {
		const response = await app.inject({ url: "/test/non-string-code" });

		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: { code: "BAD_REQUEST", message: "Bad input" },
		});
	});
});
