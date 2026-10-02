import { z } from "zod";

// What every form Server Action returns, for use with useActionState.
// Only expected errors go here (see lib/errors.ts). Unexpected ones are thrown.
export type ActionState<Field extends string = string> = {
  // Form-level message, shown above the submit button
  error?: string;
  fieldErrors?: Partial<Record<Field, string[]>>;
  // Echo back non-sensitive values so the form keeps them after an error
  values?: Partial<Record<Field, string>>;
};

// The state to return when the Zod schema rejects the submitted form
export function validationError<Input>(
  error: z.ZodError<Input>,
  values?: Partial<Record<keyof Input & string, string>>,
): ActionState<keyof Input & string> {
  return { fieldErrors: z.flattenError(error).fieldErrors, values };
}
