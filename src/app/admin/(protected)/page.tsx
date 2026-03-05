import { Users, Layers, LayoutList, CheckSquare, Mail } from "lucide-react";
import { getAdminStats } from "@/server/actions/admin-data-actions";

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Total Users",       value: stats.users,              icon: Users,       color: "text-blue-400" },
    { label: "Workspaces",        value: stats.workspaces,         icon: Layers,      color: "text-purple-400" },
    { label: "Boards",            value: stats.boards,             icon: LayoutList,  color: "text-emerald-400" },
    { label: "Cards",             value: stats.cards,              icon: CheckSquare, color: "text-amber-400" },
    { label: "Pending Invites",   value: stats.pendingInvitations, icon: Mail,        color: "text-rose-400" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</span>
              <Icon className={`size-4 ${color}`} />
            </div>
            <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
