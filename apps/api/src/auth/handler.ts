import { toNodeHandler } from "better-auth/node";
import type { FastifyPluginAsync } from "fastify";
import { auth } from "./auth.ts";

const handleAuth = toNodeHandler(auth);

export const authHandler: FastifyPluginAsync = async (app) => {
	// A request body can only be read once, and better-auth reads it from the raw
	// request itself, so stop Fastify parsing it first. Only affects this plugin.
	app.removeAllContentTypeParsers();
	app.addContentTypeParser("*", (_request, _payload, done) => done(null));

	app.route({
		method: ["GET", "POST"],
		url: "/api/auth/*",
		async handler(request, reply) {
			reply.hijack();
			await handleAuth(request.raw, reply.raw);
		},
	});
};
