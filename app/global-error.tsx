"use client"; // Error boundaries must be Client Components

import "./globals.css";
import { ErrorFallback } from "./error-fallback";

// Only used when the root layout itself throws. It replaces the root layout,
// so it renders its own <html> and <body>.
export default function GlobalError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <title>Something went wrong | Dyad</title>
        <ErrorFallback {...props} />
      </body>
    </html>
  );
}
