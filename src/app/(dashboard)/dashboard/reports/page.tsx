import { DashboardPageTemplate } from "@/components/dashboard/dashboard-page-template";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/rbac";

export default async function ReportsPage() {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD"]);

  return (
    <DashboardShell user={user} title="Reports">
      <DashboardPageTemplate
        title="Reports"
        description="Role-based delivery and performance reporting."
        stats={[
          { label: "Generated", value: 0 },
          { label: "Scheduled", value: 0 },
          { label: "Shared", value: 0 },
          { label: "Exported", value: 0 },
        ]}
      />
    </DashboardShell>
  );
}
