import { DashboardPageTemplate } from "@/components/dashboard/dashboard-page-template";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/rbac";

export default async function SprintBoardPage() {
  const user = await requireRole(["DEPARTMENT_LEAD"]);

  return (
    <DashboardShell user={user} title="Sprint Board">
      <DashboardPageTemplate
        title="Sprint Board"
        description="Department sprint planning board and flow tracking."
        stats={[
          { label: "Current Sprint", value: 0 },
          { label: "Backlog", value: 0 },
          { label: "In Progress", value: 0 },
          { label: "Blocked", value: 0 },
        ]}
      />
    </DashboardShell>
  );
}
