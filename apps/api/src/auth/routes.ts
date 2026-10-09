import { errorResponseSchema, meResponseSchema } from "@dyad/shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { requireAuth } from "./require-auth.ts";

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
	app.addHook("preHandler", requireAuth);

	app.get(
		"/api/me",
		{
			schema: {
				response: { 200: meResponseSchema, 401: errorResponseSchema },
			},
		},
		async (request) => {
			const { id, name, email } = request.user;
			return { user: { id, name, email } };
		},
	);
};
