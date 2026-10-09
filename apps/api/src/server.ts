import { buildApp } from "./app.ts";
import { env } from "./env.ts";

const app = buildApp();

for (const signal of ["SIGINT", "SIGTERM"] as const) {
	process.once(signal, async () => {
		app.log.info({ signal }, "Shutting down");
		await app.close();
		process.exit(0);
	});
}

try {
	await app.listen({ port: env.PORT, host: "0.0.0.0" });
} catch (err) {
	app.log.error(err);
	process.exit(1);
}
