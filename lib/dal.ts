import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";

// Data Access Layer: the place that verifies who the current user is.
// Every protected page and Server Action must go through these helpers.

// getSession vs requireUser:
// - getSession() asks "is anyone signed in?" and returns the session or null.
//   Use it where signed-out visitors are allowed and you only want to adapt
//   the UI, e.g. the home page links or redirecting signed-in users away
//   from /login.
// - requireUser() says "a user must be signed in here". It returns the user
//   (never null) or redirects to /login. Use it at the top of every protected
//   page and Server Action.

// Deduplicated per request, so multiple calls in one render hit the DB once
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

// Returns the signed-in user or redirects to /login
export async function requireUser() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session.user;
}
