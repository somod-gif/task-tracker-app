import { DashboardPageTemplate } from "@/components/dashboard/dashboard-page-template";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/rbac";

export default async function MyPerformancePage() {
  const user = await requireRole(["EMPLOYEE"]);

  return (
    <DashboardShell user={user} title="My Performance">
      <DashboardPageTemplate
        title="My Performance"
        description="Personal task completion and productivity trends."
        stats={[
          { label: "Completion", value: "0%" },
          { label: "Tasks Done", value: 0 },
          { label: "Active Sprints", value: 0 },
          { label: "Avg Cycle Time", value: "0d" },
        ]}
      />
    </DashboardShell>
  );
}
