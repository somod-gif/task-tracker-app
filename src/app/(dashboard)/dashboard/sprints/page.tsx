import { DashboardPageTemplate } from "@/components/dashboard/dashboard-page-template";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/rbac";

export default async function SprintsPage() {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  return (
    <DashboardShell user={user} title="Sprints">
      <DashboardPageTemplate
        title="Sprints"
        description="Sprint and backlog lifecycle management."
        stats={[
          { label: "Active Sprints", value: 0 },
          { label: "Backlogs", value: 0 },
          { label: "Completed", value: 0 },
          { label: "On Time", value: "0%" },
        ]}
      />
    </DashboardShell>
  );
}
