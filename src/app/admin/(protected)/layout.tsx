import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/admin/auth";
import { adminLogoutAction } from "@/server/actions/admin-auth-actions";
import { LayoutDashboard, Users, Layers, LogOut } from "lucide-react";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const ok = await getAdminSession();
  if (!ok) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-slate-950">
      <aside className="w-56 shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col">
        <div className="p-5 border-b border-slate-800">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Sprint Desk</p>
          <p className="text-white font-semibold text-sm mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { href: "/admin",            icon: LayoutDashboard, label: "Overview" },
            { href: "/admin/users",      icon: Users,           label: "Users" },
            { href: "/admin/workspaces", icon: Layers,          label: "Workspaces" },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}