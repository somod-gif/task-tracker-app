import { DashboardPageTemplate } from "@/components/dashboard/dashboard-page-template";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/rbac";

export default async function TasksPage() {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD"]);

  return (
    <DashboardShell user={user} title="Tasks">
      <DashboardPageTemplate
        title="Tasks"
        description="Unified task board for assignment, status, and delivery."
        stats={[
          { label: "Open Tasks", value: 0 },
          { label: "In Progress", value: 0 },
          { label: "Done", value: 0 },
          { label: "Overdue", value: 0 },
        ]}
      />
    </DashboardShell>
  );
}
