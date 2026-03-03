import { DashboardPageTemplate } from "@/components/dashboard/dashboard-page-template";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/rbac";

export default async function SettingsPage() {
  const user = await requireRole(["PLATFORM_OWNER", "SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD", "EMPLOYEE"]);

  return (
    <DashboardShell user={user} title="Settings">
      <DashboardPageTemplate
        title="Settings"
        description="Role-based workspace and personal preferences."
        stats={[
          { label: "Profile", value: "Ready" },
          { label: "Notifications", value: "Enabled" },
          { label: "Security", value: "Standard" },
          { label: "Theme", value: "System" },
        ]}
      />
    </DashboardShell>
  );
}
