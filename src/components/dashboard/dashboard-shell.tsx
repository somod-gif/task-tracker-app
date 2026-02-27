"use client";

import { Menu, Search } from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SessionUser } from "@/lib/auth/session";

export function DashboardShell({
  user,
  title,
  children,
}: {
  user: SessionUser;
  title: string;
  children: React.ReactNode;
}) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const roleLabel = user.role.replaceAll("_", " ");
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-muted/30 lg:flex">
      <div className="hidden lg:block">
        <DashboardSidebar user={user} />
      </div>

      {openSidebar ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-primary/25" aria-label="Close menu" onClick={() => setOpenSidebar(false)} />
          <div className="relative h-full w-[88%] max-w-sm bg-background shadow-xl">
            <DashboardSidebar user={user} onNavigate={() => setOpenSidebar(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex-1">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setOpenSidebar(true)}>
                <Menu className="size-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">{title}</h1>
                <p className="text-xs text-muted-foreground">
                  {user.name} · {user.companyName}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{roleLabel}</Badge>
                  {user.departmentName ? <Badge variant="outline">{user.departmentName}</Badge> : null}
                  <Badge variant="outline">{todayLabel}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search tasks, users, sprints" className="h-9 w-56 pl-8" />
              </div>
              <NotificationBell />
              <ThemeToggle />
              <details className="relative">
                <summary className="list-none">
                  <Button variant="outline" size="sm">
                    {user.name ?? "Profile"}
                  </Button>
                </summary>
                <div className="absolute right-0 z-50 mt-2 min-w-56 rounded-lg border bg-card p-2 shadow-lg">
                  <p className="px-2 py-1 text-sm font-medium">{user.name}</p>
                  <p className="px-2 pb-2 text-xs text-muted-foreground">{user.email}</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => signOut({ callbackUrl: "/login" })}>
                    Sign out
                  </Button>
                </div>
              </details>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
