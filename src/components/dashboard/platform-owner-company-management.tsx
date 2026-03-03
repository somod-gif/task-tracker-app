"use client";

import { Building2, CheckCircle2, PauseCircle, ShieldCheck, Trash2, UserCheck } from "lucide-react";
import { useActionState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
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

  function toggleActive(companyId: string, isActive: boolean) {
    startTransition(async () => {
      try {
        await toggleCompanyActiveAction(companyId);
        appToast.success(isActive ? "Company deactivated" : "Company activated");
      } catch {
        appToast.error("Could not update company status");
      }
    });
  }

  function remove(companyId: string, name: string) {
    if (!confirm(`Permanently delete "${name}" and all its users? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteCompanyAction(companyId);
        appToast.success("Company deleted");
      } catch {
        appToast.error("Could not delete company");
      }
    });
  }

  function assignSuperAdmin(companyId: string, userId: string, userName: string) {
    if (!confirm(`Promote "${userName}" to Super Admin (CEO)? They will gain full company management access.`)) return;
    startTransition(async () => {
      try {
        await assignUserAsSuperAdminAction(companyId, userId);
        appToast.success(`${userName} promoted to Super Admin`);
      } catch {
        appToast.error("Promotion failed");
      }
    });
  }

  return (
    <div className="space-y-6">

      {/* Create Company */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base">Create Company Manually</CardTitle>
              <CardDescription className="text-xs">
                Directly provision a tenant without going through the public registration flow. The company is activated immediately.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form action={createAction} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="c-name">Company Name <span className="text-destructive">*</span></Label>
              <Input id="c-name" name="name" placeholder="Acme Corp" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="c-email">Contact Email</Label>
              <Input id="c-email" name="contactEmail" type="email" placeholder="contact@acme.com" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="c-phone">Contact Phone</Label>
              <Input id="c-phone" name="contactPhone" placeholder="+1 555 000 0000" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="c-address">Registered Address</Label>
              <Input id="c-address" name="address" placeholder="123 Business Ave, City, Country" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="c-website">Website</Label>
              <Input id="c-website" name="website" placeholder="https://acme.com" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="c-logo">Logo URL</Label>
              <Input id="c-logo" name="logo" placeholder="https://cdn.acme.com/logo.png" />
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                id="c-active"
                name="isActive"
                defaultChecked
                className="h-4 w-4 rounded border-input accent-primary"
              />
              <Label htmlFor="c-active" className="cursor-pointer font-normal">
                Activate company immediately (uncheck to create as inactive)
              </Label>
            </div>

            {createState.error ? (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive md:col-span-2">{createState.error}</p>
            ) : null}
            {createState.success ? (
              <p className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 md:col-span-2">
                <CheckCircle2 className="size-4" /> Company created successfully
              </p>
            ) : null}

            <div className="md:col-span-2">
              <Button type="submit" disabled={isPending}>
                Create Company
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Company List */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">All Companies ({companies.length})</CardTitle>
          <CardDescription className="text-xs">
            Edit company details, toggle active status, or remove a company. Use the user table to promote a member to Super Admin (CEO).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {companies.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <Building2 className="size-8 opacity-40" />
              <p className="text-sm">No companies yet. Create one above or approve a registration request.</p>
            </div>
          ) : (
            companies.map((company) => (
              <div key={company.id} className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-4">

                {/* Company header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{company.name}</p>
                      <Badge variant={company.isActive ? "default" : "secondary"} className="text-[10px]">
                        {company.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {company.contactEmail ?? "—"} · {company.contactPhone ?? "—"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => toggleActive(company.id, company.isActive)}
                      className="gap-1.5 text-xs"
                    >
                      {company.isActive ? (
                        <><PauseCircle className="size-3.5" /> Deactivate</>
                      ) : (
                        <><CheckCircle2 className="size-3.5" /> Activate</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isPending}
                      onClick={() => remove(company.id, company.name)}
                      className="gap-1.5 text-xs"
                    >
                      <Trash2 className="size-3.5" /> Delete
                    </Button>
                  </div>
                </div>

                {/* Inline edit form */}
                <details className="rounded-lg border border-border/50">
                  <summary className="cursor-pointer select-none rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40">
                    Edit Company Details
                  </summary>
                  <form action={updateAction} className="grid gap-3 p-3 md:grid-cols-2">
                    <input type="hidden" name="id" value={company.id} />
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs">Company Name <span className="text-destructive">*</span></Label>
                      <Input name="name" defaultValue={company.name} required />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Contact Email</Label>
                      <Input name="contactEmail" type="email" defaultValue={company.contactEmail ?? ""} placeholder="contact@acme.com" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Contact Phone</Label>
                      <Input name="contactPhone" defaultValue={company.contactPhone ?? ""} placeholder="+1 555 000 0000" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs">Address</Label>
                      <Input name="address" defaultValue={company.address ?? ""} placeholder="Address" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Website</Label>
                      <Input name="website" defaultValue={company.website ?? ""} placeholder="https://acme.com" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Logo URL</Label>
                      <Input name="logo" defaultValue={company.logo ?? ""} placeholder="https://cdn.acme.com/logo.png" />
                    </div>
                    <div className="flex items-center gap-2 md:col-span-2">
                      <input
                        type="checkbox"
                        id={`active-${company.id}`}
                        name="isActive"
                        defaultChecked={company.isActive}
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                      <Label htmlFor={`active-${company.id}`} className="cursor-pointer text-xs font-normal">Active</Label>
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit" size="sm" disabled={isPending}>Save Changes</Button>
                    </div>
                  </form>
                </details>

                {/* Users table */}
                {company.users.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Members ({company.users.length})
                    </p>
                    <div className="rounded-lg border border-border/50 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="text-xs">Name</TableHead>
                            <TableHead className="text-xs">Email</TableHead>
                            <TableHead className="text-xs">Role</TableHead>
                            <TableHead className="text-xs">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {company.users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="text-sm font-medium">{user.name}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-[10px]">
                                  {user.role.replace(/_/g, " ")}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.role !== "SUPER_ADMIN" ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={isPending}
                                    onClick={() => assignSuperAdmin(company.id, user.id, user.name)}
                                    className="h-7 gap-1.5 text-xs"
                                  >
                                    <UserCheck className="size-3" />
                                    <ShieldCheck className="size-3" />
                                    Make Super Admin
                                  </Button>
                                ) : (
                                  <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                    <ShieldCheck className="size-3.5" /> Owner
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {updateState.error ? (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{updateState.error}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

