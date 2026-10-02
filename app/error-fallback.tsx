"use client";

// Shared UI for error.tsx and global-error.tsx. In production, Next.js hides
// the real message of server errors; `digest` matches the server log entry.
export function ErrorFallback({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-neutral-600">
        Try again. If it keeps happening, try again later.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-md bg-black px-4 py-2 font-medium text-white"
      >
        Try again
      </button>
      {error.digest && (
        <p className="text-xs text-neutral-500">Reference: {error.digest}</p>
      )}
    </main>
  );
}
