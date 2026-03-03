import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { PublicShell } from "@/components/marketing/public-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { dashboardByRole } from "@/lib/rbac";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(dashboardByRole[user.role]);
  }

  return (
    <PublicShell activePath="/login">
      <main className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-7xl lg:grid-cols-2">
        <section className="hidden rounded-xl bg-gradient-to-b from-primary to-primary/70 text-primary-foreground lg:flex lg:items-center lg:justify-center lg:m-6">
          <div className="max-w-md px-10 text-center">
            <h1 className="text-5xl font-bold tracking-tight">Sprint Desk Task Tracker</h1>
            <p className="mt-6 text-2xl font-medium text-primary-foreground/80">Streamline your business with our task tracker platform</p>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-8">
          <LoginForm />
        </section>
      </main>
    </PublicShell>
  );
}
