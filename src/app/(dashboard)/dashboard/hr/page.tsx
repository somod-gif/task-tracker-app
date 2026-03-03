import { DashboardPageTemplate } from "@/components/dashboard/dashboard-page-template";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/rbac";

export default async function HrPage() {
  const user = await requireRole(["ADMIN"]);

  return (
    <DashboardShell user={user} title="HR">
      <DashboardPageTemplate
        title="HR"
        description="HR operations, staffing, and internal people processes."
        stats={[
          { label: "Open Roles", value: 0 },
          { label: "Onboarding", value: 0 },
          { label: "Policy Updates", value: 0 },
          { label: "Requests", value: 0 },
        ]}
      />
    </DashboardShell>
  );
}
