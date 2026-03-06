import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/auth/session";
import { BrandLogo } from "@/components/branding/brand-logo";
import { PublicShell } from "@/components/marketing/public-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Forgot Password" };

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) redirect("/workspace");

  return (
    <PublicShell activePath="">
      <main className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-6 px-4 py-12">
        <BrandLogo />
        <ForgotPasswordForm />
      </main>
    </PublicShell>
  );
}
