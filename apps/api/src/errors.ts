import type { ErrorResponse } from "@dyad/shared";
import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * Throw for failures caused by the request (bad input, not signed in, not allowed).
 * The status, code and message are sent to the client as-is, so keep messages user-safe.
 */
export class HttpError extends Error {
	readonly statusCode: number;
	readonly code: string;

	constructor(statusCode: number, code: string, message: string) {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
	}
}

/** Gives every error the same `{ error: { code, message } }` shape and keeps server internals out of responses. */
export function errorHandler(
	error: unknown,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	// A client error is a 4xx: the request was wrong, not the server, so its message is
	// safe to show.
	if (
		error instanceof Error &&
		"statusCode" in error &&
		typeof error.statusCode === "number" &&
		error.statusCode >= 400 &&
		error.statusCode < 500
	) {
		const code =
			"code" in error && typeof error.code === "string"
				? error.code
				: "BAD_REQUEST";
		const body: ErrorResponse = { error: { code, message: error.message } };
		return reply.status(error.statusCode).send(body);
	}

	// Server error messages can contain internals (hosts, queries), so log them and send a generic one.
	request.log.error({ err: error }, "Unhandled error");
	const body: ErrorResponse = {
		error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" },
	};
	return reply.status(500).send(body);
}

/**
 * Unknown routes don't throw, so they never reach errorHandler. This gives them the same
 * error shape. A 404 thrown from a route (e.g. a missing record) goes through errorHandler.
 */
export function notFoundHandler(request: FastifyRequest, reply: FastifyReply) {
	const body: ErrorResponse = {
		error: {
			code: "NOT_FOUND",
			message: `Route ${request.method} ${request.url} not found`,
		},
	};
	return reply.status(404).send(body);
}
