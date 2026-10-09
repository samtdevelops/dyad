import { z } from "zod";

export const meResponseSchema = z.object({
	user: z.object({
		id: z.string(),
		name: z.string(),
		email: z.email(),
	}),
});

export type MeResponse = z.infer<typeof meResponseSchema>;
