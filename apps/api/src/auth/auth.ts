import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../db.ts";
import { env } from "../env.ts";
import { logger } from "../logger.ts";

export const auth = betterAuth({
	database: prismaAdapter(prisma, { provider: "postgresql" }),
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	emailAndPassword: {
		enabled: true,
	},
	logger: {
		log: (level, message, ...args) => {
			const err = args.find((arg) => arg instanceof Error);
			logger[level]({ err }, message);
		},
	},
});
