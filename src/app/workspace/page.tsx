import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, LayoutDashboard } from "lucide-react";

import { requireAuth } from "@/lib/auth/session";
import { getUserWorkspacesAction } from "@/server/actions/workspace-actions";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function WorkspaceIndexPage() {
  const user = await requireAuth().catch(() => null);
  if (!user) redirect("/login");

  const result = await getUserWorkspacesAction();
  const workspaces = (result.success && result.data) ? result.data : [];

  if (workspaces.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4 sm:p-8">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <LayoutDashboard className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to Sprint Desk</h1>
          <p className="mt-2 text-muted-foreground">
            Create your first workspace to start organizing your work. You can invite teammates, create boards, and track tasks from one place.
          </p>
          <div className="mt-4 rounded-lg border bg-card/70 p-3 text-left text-sm text-muted-foreground">
            <p className="font-medium text-foreground">What you can do next</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4">
              <li>Create boards for each project or team</li>
              <li>Invite members and assign roles</li>
              <li>Track work from backlog to done</li>
            </ul>
          </div>
          <div className="mt-6">
            <CreateWorkspaceDialog>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" /> Create workspace
              </Button>
            </CreateWorkspaceDialog>
          </div>
        </div>
      </div>
    );
  }

  // Auto-redirect to first workspace if only one
  if (workspaces.length === 1) {
    redirect(`/workspace/${workspaces[0].id}`);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your workspaces</h1>
          <p className="text-sm text-muted-foreground">{workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}. Open a workspace to manage boards, members, and settings.</p>
        </div>
        <CreateWorkspaceDialog>
          <Button className="gap-2 sm:self-auto">
            <Plus className="h-4 w-4" /> New workspace
          </Button>
        </CreateWorkspaceDialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {workspaces.map((ws) => (
          <Link key={ws.id} href={`/workspace/${ws.id}`}>
            <Card className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 border border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {ws.role.toLowerCase()}
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-base">{ws.name}</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                {ws.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{ws.description}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {ws.memberCount} member{ws.memberCount !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
