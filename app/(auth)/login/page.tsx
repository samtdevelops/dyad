import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/dal";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getSession()) {
    redirect("/dashboard");
  }
  return <AuthForm mode="signIn" />;
}
