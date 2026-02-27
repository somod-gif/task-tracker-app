import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/rbac";
import { getAdminOverview, getSuperAdminOverview, getTeamLeadOverview } from "@/server/services/dashboard-service";

export default async function TeamLeadsPage() {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD", "PLATFORM_OWNER", "EMPLOYEE"]);

  if (user.role === "SUPER_ADMIN") {
    const overview = await getSuperAdminOverview();
    const teamLeads = overview.users.filter((person) => String(person.role) === "DEPARTMENT_LEAD");

    return (
      <DashboardShell user={user} title="Team Leads">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard title="Team Leads" value={teamLeads.length} helper="Visible in current data window" />
            <MetricCard title="Departments" value={overview.metrics.departments} helper="Total departments" />
            <MetricCard title="Companies" value={overview.metrics.companies} helper="Managed organizations" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Leadership Directory</CardTitle>
              <CardDescription>Department leads by company and department.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Department</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.company?.name ?? "-"}</TableCell>
                      <TableCell>{lead.department?.name ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  if (user.role === "ADMIN") {
    const overview = await getAdminOverview(user);
    const teamLeads = overview.users.filter((person) => String(person.role) === "DEPARTMENT_LEAD");

    return (
      <DashboardShell user={user} title="Team Leads">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard title="Team Leads" value={teamLeads.length} helper="Leads in your company" />
            <MetricCard title="Employees" value={overview.metrics.employees} helper="Employees in your company" />
            <MetricCard title="Departments" value={overview.metrics.departments} helper="Operational departments" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Team Lead Management</CardTitle>
              <CardDescription>Department leadership view for your company.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.department?.name ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  if (user.role === "DEPARTMENT_LEAD") {
    const overview = await getTeamLeadOverview(user);

    return (
      <DashboardShell user={user} title="Team Leads">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard title="My Team" value={overview.metrics.teamMembers} helper="Employees in your department" />
          <MetricCard title="Tasks" value={overview.metrics.tasks} helper="Department tasks" />
          <MetricCard title="Completed" value={overview.metrics.completedTasks} helper="Done tasks" />
          <MetricCard title="Completion" value={overview.metrics.completionRate} subtitle="%" helper="Delivery score" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell user={user} title="Team Leads">
      <Card>
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
          <CardDescription>This page is available to Super Admin, Admin, and Department Lead roles.</CardDescription>
        </CardHeader>
      </Card>
    </DashboardShell>
  );
}
