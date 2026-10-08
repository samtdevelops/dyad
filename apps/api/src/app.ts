import { healthResponseSchema } from "@dyad/shared";
import Fastify from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";

export function buildApp() {
	const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);

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
