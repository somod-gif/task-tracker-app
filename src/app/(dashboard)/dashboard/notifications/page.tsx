import { DashboardPageTemplate } from "@/components/dashboard/dashboard-page-template";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/rbac";

export default async function NotificationsPage() {
  const user = await requireRole(["PLATFORM_OWNER", "SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD", "EMPLOYEE"]);

  return (
    <DashboardShell user={user} title="Notifications">
      <DashboardPageTemplate
        title="Notifications"
        description="Latest system, sprint, task, and approval alerts."
        stats={[
          { label: "Unread", value: 0 },
          { label: "Today", value: 0 },
          { label: "Task Alerts", value: 0 },
          { label: "System Alerts", value: 0 },
        ]}
      />
    </DashboardShell>
  );
}
