import { DashboardPageTemplate } from "@/components/dashboard/dashboard-page-template";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/rbac";

export default async function MyTasksPage() {
  const user = await requireRole(["EMPLOYEE"]);

  return (
    <DashboardShell user={user} title="My Tasks">
      <DashboardPageTemplate
        title="My Tasks"
        description="Your assigned tasks and deadline visibility."
        stats={[
          { label: "Assigned", value: 0 },
          { label: "In Progress", value: 0 },
          { label: "Done", value: 0 },
          { label: "Overdue", value: 0 },
        ]}
      />
    </DashboardShell>
  );
}
