import { redirect } from "next/navigation";
import { getAdminSession, adminEnabled } from "@/lib/admin/auth";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default async function AdminLoginPage() {
  if (!adminEnabled()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Admin Disabled</h1>
          <p className="text-slate-400 text-sm">Set ADMIN_EMAIL and ADMIN_PASSWORD in env to enable.</p>
        </div>
      </main>
    );
  }

  const ok = await getAdminSession();
  if (ok) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Sprint Desk</h1>
          <p className="mt-1 text-sm text-slate-400">Admin Dashboard</p>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  );
}
