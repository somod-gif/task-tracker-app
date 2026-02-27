import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { dashboardByRole } from "@/lib/rbac";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(dashboardByRole[user.role]);
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-gradient-to-b from-blue-600 to-slate-700 text-white lg:flex lg:items-center lg:justify-center">
        <div className="max-w-md px-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight">Spint Desk Task Tracker</h1>
          <p className="mt-6 text-2xl font-medium text-white/80">Streamline your business with our Task Tracker Platform</p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-muted/20 px-4 py-10 sm:px-8">
        <LoginForm />
      </section>
    </main>
  );
}
