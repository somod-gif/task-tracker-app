"use client";

import { Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const init = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(init);
      clearInterval(id);
    };
  }, []);

  const roleLabel = user.role.replaceAll("_", " ");

  const timeLabel = now?.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) ?? "";

  const dateLabel = now?.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }) ?? "";

  const initials = (user.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* Sidebar — desktop */}
      <div className="hidden h-screen shrink-0 lg:block">
        <DashboardSidebar user={user} collapsed={collapsedSidebar} onToggleCollapse={() => setCollapsedSidebar((s) => !s)} />
      </div>

      {/* Sidebar — mobile overlay */}
      {openSidebar ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpenSidebar(false)}
          />
          <div className="relative h-full w-[84%] max-w-xs bg-background shadow-2xl">
            <DashboardSidebar user={user} onNavigate={() => setOpenSidebar(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* ── Top bar ── lean, single row, fixed 56px */}
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
          <div className="flex h-14 items-center justify-between px-3 sm:px-5">

            {/* Left: toggle + title */}
            <div className="flex min-w-0 items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 h-9 w-9 p-0 lg:hidden"
                onClick={() => setOpenSidebar(true)}
              >
                <Menu className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hidden shrink-0 h-9 w-9 p-0 lg:inline-flex"
                onClick={() => setCollapsedSidebar((s) => !s)}
              >
                {collapsedSidebar ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
              </Button>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold leading-none tracking-tight">{title}</h1>
                <p className="hidden truncate text-[11px] leading-tight text-muted-foreground sm:block">
                  {user.companyName ?? user.name}
                </p>
              </div>
            </div>

            {/* Right: search (md+) · notification · theme · avatar */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <div className="relative hidden lg:block">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search…"
                  className="h-8 w-44 rounded-full border-border/60 bg-muted/40 pl-8 text-sm transition-all duration-300 focus:w-60"
                />
              </div>

              <NotificationBell />
              <ThemeToggle />

              {/* Avatar dropdown */}
              <details className="relative">
                <summary className="list-none cursor-pointer">
                  <button
                    type="button"
                    aria-label="Open profile menu"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground ring-2 ring-primary/20 transition-all hover:ring-primary/50"
                  >
                    {initials}
                  </button>
                </summary>
                <div className="absolute right-0 z-50 mt-2.5 min-w-64 rounded-xl border border-border/60 bg-card shadow-xl">
                  {/* Profile header */}
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  {/* Role badges */}
                  <div className="flex flex-wrap gap-1.5 px-4 py-2.5 border-b border-border/50">
                    <Badge variant="secondary" className="text-[10px]">{roleLabel}</Badge>
                    {user.departmentName ? (
                      <Badge variant="outline" className="text-[10px]">{user.departmentName}</Badge>
                    ) : null}
                  </div>
                  {/* Sign out */}
                  <div className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                      Sign out
                    </Button>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </header>

        {/* ── Context strip ── live clock, role, user context */}
        <div className="shrink-0 border-b border-border/40 bg-card/40 px-3 py-2 sm:px-5">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
            {/* Left: role + department + name */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wide">
                {roleLabel}
              </Badge>
              {user.departmentName ? (
                <Badge variant="outline" className="text-[10px]">{user.departmentName}</Badge>
              ) : null}
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {user.name}{user.companyName ? ` · ${user.companyName}` : ""}
              </span>
            </div>
            {/* Right: live date + clock */}
            <div className="flex items-center gap-2" suppressHydrationWarning>
              <span className="hidden text-xs text-muted-foreground md:inline" suppressHydrationWarning>
                {dateLabel}
              </span>
              <span
                className="rounded-md border border-border/60 bg-background px-2.5 py-0.5 font-mono text-xs font-medium tabular-nums text-foreground"
                suppressHydrationWarning
              >
                {timeLabel}
              </span>
            </div>
          </div>
        </div>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-3 py-5 sm:px-5 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
