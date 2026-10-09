import { healthResponseSchema } from "@dyad/shared";
import Fastify from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { authHandler } from "./auth/handler.ts";
import { authRoutes } from "./auth/routes.ts";
import { prisma } from "./db.ts";
import { errorHandler, notFoundHandler } from "./errors.ts";
import { logger } from "./logger.ts";

export function buildApp() {
	const app = Fastify({
		loggerInstance: logger,
	}).withTypeProvider<ZodTypeProvider>();

	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);
	app.setErrorHandler(errorHandler);
	app.setNotFoundHandler(notFoundHandler);

	app.addHook("onClose", () => prisma.$disconnect());

	app.register(authHandler);
	app.register(authRoutes);

	app.get(
		"/api/health",
		{
			schema: {
				response: { 200: healthResponseSchema },
			},
		},
		() => ({ status: "ok" as const, timestamp: new Date().toISOString() }),
	);

	return app;
}
