"use client";

import Link from "next/link";
import { type ComponentProps, useActionState } from "react";
import { type AuthFormState, signIn, signUp } from "./actions";

const modes = {
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

export function AuthForm({ mode }: { mode: keyof typeof modes }) {
  const modeConfig = modes[mode];

  // useActionState: like useState, but the state only changes when the form is
  // submitted. Each submit runs the action, and what it returns becomes the new
  // state (unless it redirects).
  //
  // <AuthFormState, FormData>: TypeScript type parameters.
  // They tell the hook the type of the state (AuthFormState) and of
  // what each submit passes to the action (FormData, the form's fields).
  //
  // Arguments:
  // - modeConfig.action: the Server Action to run on submit (signIn or signUp).
  //   React calls it as action(previousState, formData).
  // - {}: the initial state, before anything has been submitted.
  //
  // Returns:
  // - state: what the action last returned (errors and the values to refill
  //   the form with), or the initial state before the first submit.
  // - formAction: the action wrapped by React. Pass it to <form action={...}>
  //   so React knows which state to update when the action returns.
  // - pending: true while the action is running.
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    modeConfig.action,
    {},
  );

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold">{modeConfig.title}</h1>

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
            {pending ? modeConfig.pending : modeConfig.submit}
          </button>
        </form>

        <p className="mt-6 text-sm text-neutral-600">
          {modeConfig.altText}{" "}
          <Link href={modeConfig.altHref} className="font-medium underline">
            {modeConfig.altLink}
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
} & ComponentProps<"input">) {
  // This & combines OUR prop types with the types of props <input /> accepts
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
