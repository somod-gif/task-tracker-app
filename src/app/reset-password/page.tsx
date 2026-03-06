import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/auth/session";
import { BrandLogo } from "@/components/branding/brand-logo";
import { PublicShell } from "@/components/marketing/public-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Reset Password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/workspace");

  const { token } = await searchParams;
  if (!token) redirect("/forgot-password");

  return (
    <PublicShell activePath="">
      <main className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-6 px-4 py-12">
        <BrandLogo />
        <ResetPasswordForm token={token} />
      </main>
    </PublicShell>
  );
}
