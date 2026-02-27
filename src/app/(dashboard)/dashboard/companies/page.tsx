import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PlatformOwnerCompanyManagement } from "@/components/dashboard/platform-owner-company-management";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireRole } from "@/lib/rbac";
import { getAdminOverview, getPlatformOwnerOverview, getSuperAdminOverview } from "@/server/services/dashboard-service";

export default async function CompaniesPage() {
  const user = await requireRole(["PLATFORM_OWNER", "SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD", "EMPLOYEE"]);

  if (user.role === "PLATFORM_OWNER") {
    const overview = await getPlatformOwnerOverview();

    return (
      <DashboardShell user={user} title="Companies">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard title="Companies" value={overview.metrics.companies} helper="Total tenant organizations" />
            <MetricCard title="Active" value={overview.metrics.activeCompanies} helper="Currently operational" />
            <MetricCard title="Users" value={overview.metrics.users} helper="Cross-tenant users" />
            <MetricCard title="Super Admins" value={overview.metrics.superAdmins} helper="Executive owners" />
          </div>
          <PlatformOwnerCompanyManagement companies={overview.companies} />
        </div>
      </DashboardShell>
    );
  }

  if (user.role === "SUPER_ADMIN") {
    const overview = await getSuperAdminOverview();

    return (
      <DashboardShell user={user} title="Companies">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard title="Companies" value={overview.metrics.companies} helper="Tenant organizations" />
            <MetricCard title="Departments" value={overview.metrics.departments} helper="Operational units" />
            <MetricCard title="Users" value={overview.metrics.users} helper="Platform users" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Company Directory</CardTitle>
              <CardDescription>Monitor company footprint and task load.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Departments</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Tasks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company._count.departments}</TableCell>
                      <TableCell>{company._count.users}</TableCell>
                      <TableCell>{company._count.tasks}</TableCell>
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
      <DashboardShell user={user} title="Companies">
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard title="Departments" value={overview.metrics.departments} helper="Managed units" />
          <MetricCard title="Users" value={overview.users.length} helper="People in this company" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{user.companyName}</CardTitle>
            <CardDescription>Current company workspace</CardDescription>
          </CardHeader>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell user={user} title="Companies">
      <Card>
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
          <CardDescription>This page is available to Platform Owner, Super Admin, and Admin roles.</CardDescription>
        </CardHeader>
      </Card>
    </DashboardShell>
  );
}
