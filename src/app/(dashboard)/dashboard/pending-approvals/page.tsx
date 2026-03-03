import { CheckCircle2, XCircle, Building2, Mail, Phone, MapPin, Globe, User, Clock } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { approveCompanyAction, rejectCompanyAction } from "@/server/actions/platform-owner-actions";

export default async function PendingApprovalsPage() {
  const user = await requireRole(["PLATFORM_OWNER"]);

  const pendingCompanies = await prisma.company.findMany({
    where: { isActive: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      contactEmail: true,
      contactPhone: true,
      address: true,
      website: true,
      createdAt: true,
      users: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });

  const approvedToday = await prisma.company.count({
    where: {
      isActive: true,
      updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
  });

  const totalActive = await prisma.company.count({ where: { isActive: true } });

  // Pre-compute human-readable submit dates during data fetch (avoids impure Date.now() in render)
  const pendingWithAge = pendingCompanies.map((c) => {
    const diffMs = new Date().getTime() - c.createdAt.getTime();
    const days = Math.floor(diffMs / 86_400_000);
    const ageLabel = days === 0 ? "Submitted today" : `${days}d ago`;
    return { ...c, ageLabel };
  });

  return (
    <DashboardShell user={user} title="Pending Approvals">
      <div className="space-y-8">

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            { label: "Awaiting Approval", value: pendingCompanies.length, accent: pendingCompanies.length > 0 },
            { label: "Approved Today", value: approvedToday, accent: false },
            { label: "Total Active", value: totalActive, accent: false },
            { label: "Action Needed", value: pendingCompanies.length > 0 ? "Yes" : "None", accent: pendingCompanies.length > 0 },
          ].map((s) => (
            <Card key={s.label} className={`border-border/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${s.accent ? "border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20" : "bg-card/75"}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold tracking-tight md:text-3xl ${s.accent ? "text-amber-600 dark:text-amber-400" : ""}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Page header */}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Company Registration Requests</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Companies submitted via the public registration form. Review their details, then approve to grant access or reject to remove the request.
          </p>
        </div>

        {pendingWithAge.length === 0 ? (
          <Card className="border-border/60 bg-card/60">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <CheckCircle2 className="size-12 text-green-500/70" />
              <p className="text-lg font-semibold">All caught up</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                There are no pending company registration requests right now. New submissions will appear here for review.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {pendingWithAge.map((company) => {
              const ceo = company.users.find((u) => u.role === "SUPER_ADMIN") ?? company.users[0];

              return (
                <Card key={company.id} className="border-border/70 bg-card/80 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Building2 className="size-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{company.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {company.ageLabel}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0 border-amber-400/50 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Company details */}
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2 text-sm">
                      {company.contactEmail && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="size-3.5 shrink-0" />
                          <span className="truncate">{company.contactEmail}</span>
                        </div>
                      )}
                      {company.contactPhone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="size-3.5 shrink-0" />
                          <span>{company.contactPhone}</span>
                        </div>
                      )}
                      {company.address && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" />
                          <span className="truncate">{company.address}</span>
                        </div>
                      )}
                      {company.website && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Globe className="size-3.5 shrink-0" />
                          <a href={company.website} target="_blank" rel="noopener noreferrer" className="truncate text-primary hover:underline">
                            {company.website}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* CEO / owner */}
                    {ceo && (
                      <div className="rounded-lg border border-border/60 bg-primary/5 p-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Registered Admin (CEO)</p>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                            {ceo.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{ceo.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{ceo.email}</p>
                          </div>
                          <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">
                            <User className="mr-1 size-3" />
                            {ceo.role.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* Approve / Reject */}
                    <div className="flex gap-2 pt-1">
                      <form
                        action={async () => {
                          "use server";
                          await approveCompanyAction(company.id);
                        }}
                        className="flex-1"
                      >
                        <Button type="submit" size="sm" className="w-full gap-1.5 bg-green-600 hover:bg-green-700 text-white">
                          <CheckCircle2 className="size-3.5" />
                          Approve
                        </Button>
                      </form>
                      <form
                        action={async () => {
                          "use server";
                          await rejectCompanyAction(company.id);
                        }}
                        className="flex-1"
                      >
                        <Button type="submit" size="sm" variant="destructive" className="w-full gap-1.5">
                          <XCircle className="size-3.5" />
                          Reject &amp; Delete
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* How Registration Works */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader>
            <CardTitle className="text-base">How the Registration Flow Works</CardTitle>
            <CardDescription>Reference guide for reviewing and approving onboarding requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 text-sm">
              {[
                { step: "1", title: "Public Submission", body: "A company representative visits /register-company and fills in company details (name, email, phone, address, website) plus CEO credentials (name & email). The form is publicly accessible — no login required." },
                { step: "2", title: "Account Pre-created (Inactive)", body: "On submission the system creates the Company with isActive = false and a Super Admin (CEO) user account with a temporary password from NEW_COMPANY_TEMP_PASSWORD. The company cannot log in yet." },
                { step: "3", title: "Appears Here for Review", body: "All inactive companies surface on this page. Review the company details and the pre-created CEO account before taking action." },
                { step: "4", title: "Approve → Activates Instantly", body: "Clicking Approve sets isActive = true and fires a COMPANY_APPROVED in-app notification to every Super Admin in that company. The CEO can now log in with their email + temporary password." },
                { step: "5", title: "Reject → Permanently Removed", body: "Clicking Reject deletes the company and all associated users. The submitter must re-apply if they want to onboard again." },
                { step: "6", title: "CEO First Login & Password Change", body: "On first login the CEO is prompted to change their temporary password (mustChangePassword = true). After that they can invite admins, create departments, and assign sprints." },
              ].map((item) => (
                <li key={item.step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-muted-foreground">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

      </div>
    </DashboardShell>
  );
}

