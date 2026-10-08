import { useEffect, useState } from 'react';
import { healthResponseSchema, type HealthResponse } from '@dyad/shared';

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealth(healthResponseSchema.parse(data)))
      .catch(console.error);
  }, []);

  return <pre>{health ? JSON.stringify(health, null, 2) : 'Loading…'}</pre>;
}
