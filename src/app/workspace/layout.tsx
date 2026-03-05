import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth().catch(() => null);
  if (!user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <WorkspaceSidebar userId={user.id} userName={user.name ?? ""} userEmail={user.email ?? ""} userAvatar={user.avatar ?? null} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
