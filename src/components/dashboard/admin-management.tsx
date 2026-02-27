"use client";

import { useActionState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createDepartmentAction, createEmployeeAction, promoteToDepartmentLeadAction } from "@/server/actions/admin-actions";
import { appToast } from "@/lib/toast";

const initialState = { success: false, error: "" };

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: { id: string; name: string } | null;
};

export function AdminManagement({
  departments,
  users,
}: {
  departments: Array<{ id: string; name: string }>;
  users: UserRow[];
}) {
  const [departmentState, departmentAction] = useActionState(createDepartmentAction, initialState);
  const [employeeState, employeeAction] = useActionState(createEmployeeAction, initialState);
  const [isPromoting, startTransition] = useTransition();

  function promote(userId: string) {
    startTransition(async () => {
      try {
        await promoteToDepartmentLeadAction(userId);
        appToast.success("User promoted to Department Lead");
      } catch {
        appToast.error("Promotion failed");
      }
    });
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Department</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={departmentAction} className="space-y-3">
              <Label htmlFor="dept-name">Department Name</Label>
              <Input id="dept-name" name="name" required />
              {departmentState.error ? <p className="text-xs text-destructive">{departmentState.error}</p> : null}
              <Button type="submit">Create</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={employeeAction} className="space-y-3">
              <Input name="name" placeholder="Full name" required />
              <Input name="email" type="email" placeholder="Work email" required />
              <PasswordInput name="password" placeholder="Temporary password" required />
              <select name="departmentId" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" required>
                <option value="">Department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
              {employeeState.error ? <p className="text-xs text-destructive">{employeeState.error}</p> : null}
              <Button type="submit">Create Employee</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.department?.name ?? "-"}</TableCell>
                  <TableCell>
                    {user.role === "EMPLOYEE" ? (
                      <Button variant="outline" size="sm" disabled={isPromoting} onClick={() => promote(user.id)}>
                        Promote to Department Lead
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
