import type { Metadata } from "next";
import { signOut } from "@/app/(auth)/actions";
import { requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Welcome, {user.name}</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium"
          >
            Sign out
          </button>
        </form>
      </div>
      <p className="mt-2 text-neutral-600">Signed in as {user.email}</p>
    </main>
  );
}
