import { randomUUID } from "node:crypto";
import type { LightMyRequestResponse } from "fastify";
import { afterAll, describe, expect, test } from "vitest";
import { buildApp } from "../app.ts";
import { env } from "../env.ts";

const app = buildApp();
afterAll(() => app.close());

const password = "password123";
const trustedOrigin = { origin: env.BETTER_AUTH_URL };

function sessionCookie(response: LightMyRequestResponse) {
	const cookie = response.cookies.find(
		(c) => c.name === "better-auth.session_token",
	);
	return cookie ? `${cookie.name}=${cookie.value}` : undefined;
}

async function signUp(email = `${randomUUID()}@dyad.test`) {
	const response = await app.inject({
		method: "POST",
		url: "/api/auth/sign-up/email",
		headers: trustedOrigin,
		payload: { email, password, name: "Test User" },
	});
	return { response, email, cookie: sessionCookie(response) ?? "" };
}

function getMe(cookie?: string) {
	return app.inject({
		url: "/api/me",
		headers: cookie ? { cookie } : {},
	});
}

describe("sign-up", () => {
	test("creates the user and signs them in", async () => {
		const { response, cookie } = await signUp();

		expect(response.statusCode).toBe(200);
		expect(cookie).not.toBe("");
	});

	test("rejects an email that is already registered", async () => {
		const { email } = await signUp();
		const { response } = await signUp(email);

		expect(response.statusCode).toBe(422);
	});
});

describe("sign-in", () => {
	test("signs in with the right password", async () => {
		const { email } = await signUp();
		const response = await app.inject({
			method: "POST",
			url: "/api/auth/sign-in/email",
			headers: trustedOrigin,
			payload: { email, password },
		});

		expect(response.statusCode).toBe(200);
		expect((await getMe(sessionCookie(response))).statusCode).toBe(200);
	});

	test("rejects the wrong password without signing in", async () => {
		const { email } = await signUp();
		const response = await app.inject({
			method: "POST",
			url: "/api/auth/sign-in/email",
			headers: trustedOrigin,
			payload: { email, password: "wrong-password" },
		});

		expect(response.statusCode).toBe(401);
		expect(sessionCookie(response)).toBeUndefined();
	});
});

describe("GET /api/me", () => {
	test("returns only the signed-in user's id, name and email", async () => {
		const { email, cookie } = await signUp();
		const response = await getMe(cookie);

		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			user: { id: expect.any(String), name: "Test User", email },
		});
	});

	test("returns 401 without a session", async () => {
		const response = await getMe();

		expect(response.statusCode).toBe(401);
		expect(response.json()).toEqual({
			error: { code: "UNAUTHORIZED", message: "Not signed in" },
		});
	});

	test("returns 401 for a forged session cookie", async () => {
		const response = await getMe("better-auth.session_token=forged");

		expect(response.statusCode).toBe(401);
	});
});

describe("sign-out", () => {
	// Regression: Fastify's JSON parser used to reject this before better-auth saw it.
	test("ends the session when sent with a JSON content-type and no body", async () => {
		const { cookie } = await signUp();
		const response = await app.inject({
			method: "POST",
			url: "/api/auth/sign-out",
			headers: { ...trustedOrigin, cookie, "content-type": "application/json" },
		});

		expect(response.statusCode).toBe(200);
		expect((await getMe(cookie)).statusCode).toBe(401);
	});

	test("rejects requests from an untrusted origin and keeps the session", async () => {
		const { cookie } = await signUp();
		const response = await app.inject({
			method: "POST",
			url: "/api/auth/sign-out",
			headers: { origin: "https://evil.example", cookie },
		});

		expect(response.statusCode).toBe(403);
		expect((await getMe(cookie)).statusCode).toBe(200);
	});
});
