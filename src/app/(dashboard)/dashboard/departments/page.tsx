import { DashboardPageTemplate } from "@/components/dashboard/dashboard-page-template";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/rbac";

export default async function DepartmentsPage() {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  return (
    <DashboardShell user={user} title="Departments">
      <DashboardPageTemplate
        title="Departments"
        description="Create and manage company departments."
        stats={[
          { label: "Departments", value: 0 },
          { label: "Team Leads", value: 0 },
          { label: "Employees", value: 0 },
          { label: "Open Tasks", value: 0 },
        ]}
      />
    </DashboardShell>
  );
}
