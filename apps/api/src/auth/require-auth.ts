import { fromNodeHeaders } from "better-auth/node";
import type { preHandlerAsyncHookHandler } from "fastify";
import { HttpError } from "../errors.ts";
import { auth } from "./auth.ts";

declare module "fastify" {
	interface FastifyRequest {
		// request.user only exists when the requireAuth preHandler runs on the route.
		user: typeof auth.$Infer.Session.user;
	}
}

export const requireAuth: preHandlerAsyncHookHandler = async (request) => {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(request.headers),
	});
	if (!session) {
		throw new HttpError(401, "UNAUTHORIZED", "Not signed in");
	}

	request.user = session.user;
};
