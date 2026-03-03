import { DashboardPageTemplate } from "@/components/dashboard/dashboard-page-template";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/rbac";

export default async function TeamMembersPage() {
  const user = await requireRole(["DEPARTMENT_LEAD"]);

  return (
    <DashboardShell user={user} title="Team Members">
      <DashboardPageTemplate
        title="Team Members"
        description="Your department team members and assignment capacity."
        stats={[
          { label: "Team Members", value: 0 },
          { label: "Available", value: 0 },
          { label: "Assigned", value: 0 },
          { label: "On Leave", value: 0 },
        ]}
      />
    </DashboardShell>
  );
}
