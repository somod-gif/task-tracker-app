import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/auth/session";
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
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <ResetPasswordForm token={token} />
      </main>
    </PublicShell>
  );
}
