import { DashboardPageTemplate } from "@/components/dashboard/dashboard-page-template";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/rbac";

export default async function PlatformAnalyticsPage() {
  const user = await requireRole(["PLATFORM_OWNER"]);

  return (
    <DashboardShell user={user} title="Platform Analytics">
      <DashboardPageTemplate
        title="Platform Analytics"
        description="Platform growth, tenant performance, and operational health."
        stats={[
          { label: "Tenants", value: 0 },
          { label: "Monthly Active", value: 0 },
          { label: "Tasks This Month", value: 0 },
          { label: "Uptime", value: "99.9%" },
        ]}
      />
    </DashboardShell>
  );
}
