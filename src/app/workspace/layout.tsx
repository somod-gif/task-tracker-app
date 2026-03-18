import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth().catch(() => null);
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background md:flex md:h-screen md:overflow-hidden">
      <WorkspaceSidebar userName={user.name ?? ""} userEmail={user.email ?? ""} userAvatar={user.avatar ?? null} />
      <main className="min-w-0 md:flex-1 md:overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
