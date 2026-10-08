import { type HealthResponse, healthResponseSchema } from "@dyad/shared";
import { useEffect, useState } from "react";

export default function App() {
	const [health, setHealth] = useState<HealthResponse | null>(null);

	useEffect(() => {
		fetch("/api/health")
			.then((res) => res.json())
			.then((data) => setHealth(healthResponseSchema.parse(data)))
			.catch(console.error);
	}, []);

	return <pre>{health ? JSON.stringify(health, null, 2) : "Loading…"}</pre>;
}
