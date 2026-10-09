import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
	BETTER_AUTH_SECRET: z.string().min(32),
	BETTER_AUTH_URL: z.url(),
	PORT: z.coerce.number().int().positive().default(3000),
	LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
		.default("info"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
	throw new Error(
		`Invalid environment variables:\n${z.prettifyError(result.error)}`,
	);
}

export const env = result.data;
