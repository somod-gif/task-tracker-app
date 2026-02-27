"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { createSuperAdminManagedUserAction } from "@/server/actions/admin-actions";

const initialState = { success: false, error: "" };

type CompanyRow = { id: string; name: string };
type DepartmentRow = { id: string; name: string; companyId: string };

export function SuperAdminUserManagement({
  companies,
  departments,
}: {
  companies: CompanyRow[];
  departments: DepartmentRow[];
}) {
  const [state, action, isPending] = useActionState(createSuperAdminManagedUserAction, initialState);
  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id ?? "");
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "DEPARTMENT_LEAD" | "EMPLOYEE">("ADMIN");

  const filteredDepartments = useMemo(
    () => departments.filter((department) => department.companyId === selectedCompanyId),
    [departments, selectedCompanyId],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Company Users</CardTitle>
        <CardDescription>Create Admin, Department Lead, and Employee accounts as Super Admin.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-3 md:grid-cols-2">
          <Input name="name" placeholder="Full name" required />
          <Input name="email" type="email" placeholder="Work email" required />
          <PasswordInput name="password" placeholder="Temporary password" required />

          <select
            name="role"
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value as "ADMIN" | "DEPARTMENT_LEAD" | "EMPLOYEE")}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="DEPARTMENT_LEAD">DEPARTMENT_LEAD</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
          </select>

          <select
            name="companyId"
            value={selectedCompanyId}
            onChange={(event) => setSelectedCompanyId(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            required
          >
            <option value="">Select company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>

          <select
            name="departmentId"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm md:col-span-2"
            required={selectedRole !== "ADMIN"}
            disabled={!selectedCompanyId || selectedRole === "ADMIN"}
            defaultValue=""
          >
            <option value="">{selectedRole === "ADMIN" ? "Department not required for Admin" : "Select department"}</option>
            {filteredDepartments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>

          {state.error ? <p className="text-xs text-destructive md:col-span-2">{state.error}</p> : null}

          <div className="md:col-span-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
