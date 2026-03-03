import { DashboardPageTemplate } from "@/components/dashboard/dashboard-page-template";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/rbac";

export default async function UsersOverviewPage() {
  const user = await requireRole(["PLATFORM_OWNER"]);

  return (
    <DashboardShell user={user} title="Users Overview">
      <DashboardPageTemplate
        title="Users Overview"
        description="Cross-company users, roles, and adoption coverage."
        stats={[
          { label: "Total Users", value: 0 },
          { label: "Active Users", value: 0 },
          { label: "Companies Covered", value: 0 },
          { label: "Role Types", value: 5 },
        ]}
      />
    </DashboardShell>
  );
}
