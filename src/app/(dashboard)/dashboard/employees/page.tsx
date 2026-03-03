import { DashboardPageTemplate } from "@/components/dashboard/dashboard-page-template";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/rbac";

export default async function EmployeesPage() {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  return (
    <DashboardShell user={user} title="Employees">
      <DashboardPageTemplate
        title="Employees"
        description="Employee directory and assignment readiness."
        stats={[
          { label: "Employees", value: 0 },
          { label: "Active", value: 0 },
          { label: "Unassigned", value: 0 },
          { label: "Departments", value: 0 },
        ]}
      />
    </DashboardShell>
  );
}
