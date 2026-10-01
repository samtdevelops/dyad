import Link from "next/link";
import { getSession } from "@/lib/dal";

export default async function Home() {
  const session = await getSession();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <h1 className="text-3xl font-semibold">Dyad</h1>
      {session ? (
        <Link href="/dashboard" className="underline">
          Go to dashboard
        </Link>
      ) : (
        <div className="flex gap-4">
          <Link href="/login" className="underline">
            Sign in
          </Link>
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      )}
    </main>
  );
}
