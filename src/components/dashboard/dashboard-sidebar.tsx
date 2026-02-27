"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Crown,
  LayoutGrid,
  LayoutDashboard,
  LockKeyhole,
  Target,
  Users,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth/session";

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV_BY_ROLE: Record<SessionUser["role"], NavSection[]> = {
  PLATFORM_OWNER: [
    {
      title: "Main",
      items: [
        {
          href: "/dashboard",
          label: "Dashboard",
          description: "Platform summary and activity",
          icon: LayoutDashboard,
        },
        {
          href: "/dashboard/companies",
          label: "Companies",
          description: "Manage tenant organizations",
          icon: Building2,
        },
        {
          href: "/dashboard/users",
          label: "Users",
          description: "Cross-company people view",
          icon: Users,
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          href: "/dashboard/change-password",
          label: "Change Password",
          description: "Protect your platform account",
          icon: LockKeyhole,
        },
      ],
    },
  ],
  SUPER_ADMIN: [
    {
      title: "Main",
      items: [
        {
          href: "/dashboard",
          label: "Dashboard",
          description: "Global KPI and platform health",
          icon: LayoutDashboard,
        },
        {
          href: "/dashboard/companies",
          label: "Companies",
          description: "Multi-company governance",
          icon: Building2,
        },
        {
          href: "/dashboard/users",
          label: "Users",
          description: "User management and access",
          icon: Users,
        },
        {
          href: "/dashboard/team-leads",
          label: "Team Leads",
          description: "Leadership across departments",
          icon: Crown,
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          href: "/dashboard/change-password",
          label: "Change Password",
          description: "Password and account controls",
          icon: LockKeyhole,
        },
      ],
    },
  ],
  ADMIN: [
    {
      title: "Main",
      items: [
        {
          href: "/dashboard",
          label: "Dashboard",
          description: "Departments and workforce",
          icon: LayoutDashboard,
        },
        {
          href: "/dashboard/users",
          label: "Users",
          description: "Employees and team leads",
          icon: Users,
        },
        {
          href: "/dashboard/team-leads",
          label: "Team Leads",
          description: "Department leadership",
          icon: Target,
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          href: "/dashboard/change-password",
          label: "Change Password",
          description: "Protect your account",
          icon: LockKeyhole,
        },
      ],
    },
  ],
  DEPARTMENT_LEAD: [
    {
      title: "Main",
      items: [
        {
          href: "/dashboard",
          label: "Dashboard",
          description: "Plan and assign tasks",
          icon: LayoutDashboard,
        },
        {
          href: "/dashboard/team-leads",
          label: "Team",
          description: "Team lead and members overview",
          icon: Users,
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          href: "/dashboard/change-password",
          label: "Change Password",
          description: "Protect your account",
          icon: LockKeyhole,
        },
      ],
    },
  ],
  EMPLOYEE: [
    {
      title: "Main",
      items: [
        {
          href: "/dashboard",
          label: "Dashboard",
          description: "Personal metrics and tasks",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          href: "/dashboard/change-password",
          label: "Change Password",
          description: "Protect your account",
          icon: LockKeyhole,
        },
      ],
    },
  ],
};

export function DashboardSidebar({ user, onNavigate }: { user: SessionUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const navSections = NAV_BY_ROLE[user.role];

  function isItemActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-primary/20 bg-primary/95 p-4 text-primary-foreground lg:w-80">
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 p-3">
        <div className="rounded-full bg-primary-foreground p-2 text-primary">
          <LayoutGrid className="size-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-primary-foreground/70">Control Center</p>
          <p className="text-sm font-semibold">Dashboard Workspace</p>
        </div>
      </div>

      <div className="mb-5 rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 p-3">
        <p className="text-xs text-primary-foreground/70">Workspace</p>
        <p className="text-sm font-medium">{user.companyName}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="secondary">{user.role}</Badge>
          {user.departmentName ? <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">{user.departmentName}</Badge> : null}
        </div>
      </div>

      <div className="flex-1 space-y-5">
        {navSections.map((section) => (
          <div key={section.title} className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/8 p-2">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground/70">{section.title}</p>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive = isItemActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "block rounded-md px-3 py-2 transition-colors",
                      isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-primary-foreground/12",
                    )}
                  >
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Icon className="size-4" />
                      {item.label}
                    </div>
                    <p className={cn("mt-0.5 text-xs", isActive ? "text-secondary-foreground/80" : "text-primary-foreground/70")}>
                      {item.description}
                    </p>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        className="mt-5 w-full justify-start gap-2"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="size-4" />
        Logout
      </Button>
    </aside>
  );
}
