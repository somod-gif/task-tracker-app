import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { requireRole } from "@/lib/rbac";

export default async function ChangePasswordPage() {
  const user = await requireRole(["PLATFORM_OWNER", "SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD", "EMPLOYEE"]);

  return (
    <DashboardShell user={user} title="Security Settings">
      <ChangePasswordForm />
    </DashboardShell>
  );
}
