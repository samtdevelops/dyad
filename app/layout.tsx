import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dyad",
  description:
    "Workout logging with previous-session references and smart weight-increase suggestions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable}·h-full·antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
