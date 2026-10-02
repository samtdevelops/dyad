import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/dal";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage() {
  if (await getSession()) {
    redirect("/dashboard");
  }
  return <AuthForm mode="signUp" />;
}
