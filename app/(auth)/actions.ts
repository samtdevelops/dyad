"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { type ActionState, validationError } from "@/lib/action-state";
import { auth } from "@/lib/auth";
import { signInSchema, signUpSchema } from "./schemas";

export type AuthFormState = ActionState<"name" | "email" | "password">;

// Used with useActionState in `auth-form.tsx`, which calls it as action(previousState, formData)
// on each submit. _prev is unused because the new state doesn't depend on the
// old one, but it must stay so formData arrives as the second argument.
export async function signUp(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const raw = Object.fromEntries(formData);
  const values = {
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
  };
  const parsed = signUpSchema.safeParse(raw);

  if (!parsed.success) {
    return validationError(parsed.error, values);
  }

  try {
    await auth.api.signUpEmail({ body: parsed.data, headers: await headers() });
  } catch (error) {
    // Our own wording, not better-auth's.
    if (
      error instanceof APIError &&
      error.body?.code?.startsWith("USER_ALREADY_EXISTS")
    ) {
      return {
        fieldErrors: { email: ["An account with this email already exists"] },
        values,
      };
    }
    throw error;
  }

  redirect("/dashboard");
}

export async function signIn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const raw = Object.fromEntries(formData);
  const values = { email: String(raw.email ?? "") };
  const parsed = signInSchema.safeParse(raw);

  if (!parsed.success) {
    return validationError(parsed.error, values);
  }

  try {
    await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
  } catch (error) {
    if (
      error instanceof APIError &&
      error.body?.code === "INVALID_EMAIL_OR_PASSWORD"
    ) {
      // Generic message so we don't reveal which emails are registered
      return { error: "Invalid email or password", values };
    }
    throw error;
  }

  redirect("/dashboard");
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
