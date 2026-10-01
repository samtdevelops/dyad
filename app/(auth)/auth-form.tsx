"use client";

import Link from "next/link";
import { useActionState } from "react";
import { type AuthFormState, signIn, signUp } from "./actions";

const copy = {
  signIn: {
    action: signIn,
    title: "Sign in",
    submit: "Sign in",
    pending: "Signing in…",
    altText: "Don't have an account?",
    altHref: "/signup",
    altLink: "Sign up",
  },
  signUp: {
    action: signUp,
    title: "Create an account",
    submit: "Sign up",
    pending: "Creating account…",
    altText: "Already have an account?",
    altHref: "/login",
    altLink: "Sign in",
  },
} as const;

export function AuthForm({ mode }: { mode: keyof typeof copy }) {
  const c = copy[mode];
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    c.action,
    {},
  );

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold">{c.title}</h1>

        <form action={formAction} className="flex flex-col gap-4" noValidate>
          {mode === "signUp" && (
            <Field
              label="Name"
              name="name"
              autoComplete="name"
              defaultValue={state.values?.name}
              errors={state.fieldErrors?.name}
            />
          )}
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.values?.email}
            errors={state.fieldErrors?.email}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete={
              mode === "signUp" ? "new-password" : "current-password"
            }
            errors={state.fieldErrors?.password}
          />

          {state.error && (
            <p role="alert" className="text-sm text-red-600">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-black px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {pending ? c.pending : c.submit}
          </button>
        </form>

        <p className="mt-6 text-sm text-neutral-600">
          {c.altText}{" "}
          <Link href={c.altHref} className="font-medium underline">
            {c.altLink}
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  errors,
  ...props
}: {
  label: string;
  name: string;
  errors?: string[];
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const errorId = `${name}-error`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        required
        aria-invalid={errors ? true : undefined}
        aria-describedby={errors ? errorId : undefined}
        className="rounded-md border border-neutral-300 px-3 py-2 aria-invalid:border-red-600"
        {...props}
      />
      {errors && (
        <p id={errorId} className="text-sm text-red-600">
          {errors[0]}
        </p>
      )}
    </div>
  );
}
