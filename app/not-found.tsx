import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Not found" };

// Shown for unknown URLs and whenever notFound() is called.
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-neutral-600">
        This page doesn't exist, or you don't have access to it.
      </p>
      <Link href="/" className="underline">
        Go home
      </Link>
    </main>
  );
}
