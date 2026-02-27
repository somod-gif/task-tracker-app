"use client";

import { useActionState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { appToast } from "@/lib/toast";
import {
  assignUserAsSuperAdminAction,
  createCompanyByPlatformOwnerAction,
  deleteCompanyAction,
  toggleCompanyActiveAction,
  updateCompanyByPlatformOwnerAction,
} from "@/server/actions/platform-owner-actions";

const initialState = { success: false, error: "" };

type CompanyRow = {
  id: string;
  name: string;
  logo: string | null;
  address: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: Date;
  users: Array<{ id: string; name: string; email: string; role: string }>;
};

export function PlatformOwnerCompanyManagement({ companies }: { companies: CompanyRow[] }) {
  const [createState, createAction] = useActionState(createCompanyByPlatformOwnerAction, initialState);
  const [updateState, updateAction] = useActionState(updateCompanyByPlatformOwnerAction, initialState);
  const [isPending, startTransition] = useTransition();

  function toggleActive(companyId: string) {
    startTransition(async () => {
      try {
        await toggleCompanyActiveAction(companyId);
        appToast.success("Company status updated");
      } catch {
        appToast.error("Could not update company status");
      }
    });
  }

  function remove(companyId: string) {
    startTransition(async () => {
      try {
        await deleteCompanyAction(companyId);
        appToast.success("Company deleted");
      } catch {
        appToast.error("Could not delete company");
      }
    });
  }

  function assignSuperAdmin(companyId: string, userId: string) {
    startTransition(async () => {
      try {
        await assignUserAsSuperAdminAction(companyId, userId);
        appToast.success("User promoted to SUPER_ADMIN");
      } catch {
        appToast.error("Promotion failed");
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Company</CardTitle>
          <CardDescription>Create and activate/deactivate tenant organizations.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createAction} className="grid gap-3 md:grid-cols-2">
            <Input name="name" placeholder="Company Name" required />
            <Input name="logo" placeholder="Logo URL" />
            <Input name="address" placeholder="Address" />
            <Input name="website" placeholder="Website URL" />
            <Input name="contactEmail" type="email" placeholder="Contact Email" />
            <Input name="contactPhone" placeholder="Contact Phone" />
            <Label className="inline-flex items-center gap-2">
              <input type="checkbox" name="isActive" defaultChecked /> Active
            </Label>
            <div>
              <Button type="submit">Create Company</Button>
            </div>
          </form>
          {createState.error ? <p className="mt-2 text-xs text-destructive">{createState.error}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Companies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {companies.map((company) => (
            <div key={company.id} className="rounded-lg border p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{company.name}</p>
                  <p className="text-xs text-muted-foreground">{company.contactEmail ?? "No contact email"} · {company.contactPhone ?? "No phone"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={isPending} onClick={() => toggleActive(company.id)}>
                    {company.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button size="sm" variant="destructive" disabled={isPending} onClick={() => remove(company.id)}>
                    Delete
                  </Button>
                </div>
              </div>

              <form action={updateAction} className="mb-3 grid gap-2 md:grid-cols-3">
                <input type="hidden" name="id" value={company.id} />
                <Input name="name" defaultValue={company.name} required />
                <Input name="logo" defaultValue={company.logo ?? ""} placeholder="Logo URL" />
                <Input name="address" defaultValue={company.address ?? ""} placeholder="Address" />
                <Input name="website" defaultValue={company.website ?? ""} placeholder="Website" />
                <Input name="contactEmail" defaultValue={company.contactEmail ?? ""} placeholder="Contact Email" />
                <Input name="contactPhone" defaultValue={company.contactPhone ?? ""} placeholder="Contact Phone" />
                <Label className="inline-flex items-center gap-2 text-xs">
                  <input type="checkbox" name="isActive" defaultChecked={company.isActive} /> Active
                </Label>
                <Button type="submit" size="sm" className="w-fit">Save</Button>
              </form>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {company.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => assignSuperAdmin(company.id, user.id)}>
                          Assign SUPER_ADMIN (CEO)
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
          {updateState.error ? <p className="text-xs text-destructive">{updateState.error}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
