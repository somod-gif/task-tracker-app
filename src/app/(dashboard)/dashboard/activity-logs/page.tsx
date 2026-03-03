import { DashboardPageTemplate } from "@/components/dashboard/dashboard-page-template";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/rbac";

export default async function ActivityLogsPage() {
  const user = await requireRole(["PLATFORM_OWNER", "SUPER_ADMIN"]);

  return (
    <DashboardShell user={user} title="Activity Logs">
      <DashboardPageTemplate
        title="Activity Logs"
        description="System-wide activity and operational audit records."
        stats={[
          { label: "Today", value: 0 },
          { label: "This Week", value: 0 },
          { label: "Critical", value: 0 },
          { label: "Exported", value: 0 },
        ]}
      />
    </DashboardShell>
  );
}
