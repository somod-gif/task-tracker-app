import { AdminManagement } from "@/components/dashboard/admin-management";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SuperAdminUserManagement } from "@/components/dashboard/super-admin-user-management";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { getAdminOverview, getPlatformOwnerOverview, getSuperAdminOverview, getTeamLeadOverview } from "@/server/services/dashboard-service";

export default async function UsersPage() {
  const user = await requireRole(["PLATFORM_OWNER", "SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD", "EMPLOYEE"]);

  if (user.role === "PLATFORM_OWNER") {
    const overview = await getPlatformOwnerOverview();
    const flattenedUsers = overview.companies.flatMap((company) => company.users.map((person) => ({ ...person, companyName: company.name })));

    return (
      <DashboardShell user={user} title="Users">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard title="Total Users" value={flattenedUsers.length} helper="All tenant users" />
            <MetricCard title="Companies" value={overview.metrics.companies} helper="Active and inactive tenants" />
            <MetricCard title="Super Admins" value={overview.metrics.superAdmins} helper="Executive role holders" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Cross-Company User Directory</CardTitle>
              <CardDescription>Users grouped under their tenant organizations.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Company</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flattenedUsers.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell>{person.name}</TableCell>
                      <TableCell>{person.email}</TableCell>
                      <TableCell>{person.role}</TableCell>
                      <TableCell>{person.companyName}</TableCell>
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

  if (user.role === "SUPER_ADMIN") {
    const [overview, companies, departments] = await Promise.all([
      getSuperAdminOverview(),
      prisma.company.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.department.findMany({
        select: { id: true, name: true, companyId: true },
        orderBy: [{ company: { name: "asc" } }, { name: "asc" }],
      }),
    ]);

    return (
      <DashboardShell user={user} title="Users">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard title="Users" value={overview.metrics.users} helper="Platform users" />
            <MetricCard title="Departments" value={overview.metrics.departments} helper="Department count" />
            <MetricCard title="Companies" value={overview.metrics.companies} helper="Tenant companies" />
          </div>
          <SuperAdminUserManagement companies={companies} departments={departments} />
          <Card>
            <CardHeader>
              <CardTitle>User Overview</CardTitle>
              <CardDescription>People and access scope across companies.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Department</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.users.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell>{person.name}</TableCell>
                      <TableCell>{person.email}</TableCell>
                      <TableCell>{person.role}</TableCell>
                      <TableCell>{person.company?.name ?? "-"}</TableCell>
                      <TableCell>{person.department?.name ?? "-"}</TableCell>
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

    return (
      <DashboardShell user={user} title="Users">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard title="Employees" value={overview.metrics.employees} helper="Current employees" />
            <MetricCard title="Team Leads" value={overview.metrics.teamLeads} helper="Department leaders" />
            <MetricCard title="Departments" value={overview.metrics.departments} helper="Managed departments" />
          </div>
          <AdminManagement departments={overview.departments} users={overview.users} />
        </div>
      </DashboardShell>
    );
  }

  if (user.role === "DEPARTMENT_LEAD") {
    const overview = await getTeamLeadOverview(user);

    return (
      <DashboardShell user={user} title="Users">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard title="Team Members" value={overview.metrics.teamMembers} helper="Assignable employees" />
            <MetricCard title="Tasks" value={overview.metrics.tasks} helper="Department tasks" />
            <MetricCard title="Completed" value={overview.metrics.completedTasks} helper="Delivered tasks" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>My Team</CardTitle>
              <CardDescription>Team members in your department.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assigned Tasks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.team.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member._count.assignedTasks}</TableCell>
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

  return (
    <DashboardShell user={user} title="Users">
      <Card>
        <CardHeader>
          <CardTitle>My Profile Access</CardTitle>
          <CardDescription>Employees have user management access from the dashboard summary only.</CardDescription>
        </CardHeader>
      </Card>
    </DashboardShell>
  );
}
