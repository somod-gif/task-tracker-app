import { DashboardPageTemplate } from "@/components/dashboard/dashboard-page-template";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/rbac";

export default async function CompanyPerformancePage() {
  const user = await requireRole(["ADMIN"]);

  return (
    <DashboardShell user={user} title="Company Performance">
      <DashboardPageTemplate
        title="Company Performance"
        description="Company-wide sprint, task, and team efficiency metrics."
        stats={[
          { label: "Completion", value: "0%" },
          { label: "Velocity", value: 0 },
          { label: "Escalations", value: 0 },
          { label: "Departments", value: 0 },
        ]}
      />
    </DashboardShell>
  );
}
