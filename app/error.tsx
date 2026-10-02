"use client"; // Error boundaries must be Client Components

import { ErrorFallback } from "./error-fallback";

// Catches unexpected errors thrown by any page or Server Action below the root
// layout. Expected errors are returned by actions instead (lib/errors.ts).
export default function ErrorPage(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorFallback {...props} />;
}
