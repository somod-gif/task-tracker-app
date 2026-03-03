"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  Crown,
  FileText,
  FolderKanban,
  Gauge,
  Handshake,
  Kanban,
  LayoutGrid,
  LayoutDashboard,
  LockKeyhole,
  Settings,
  ShieldCheck,
  Rocket,
  SquareCheckBig,
  Target,
  Users,
  LogOut,
  UserCheck,
  UserCog,
  UserRound,
  UserRoundPlus,
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
          href: "/dashboard/pending-approvals",
          label: "Pending Approvals",
          description: "Approve registered companies",
          icon: ShieldCheck,
        },
        {
          href: "/dashboard/users-overview",
          label: "Users Overview",
          description: "Cross-company people view",
          icon: Users,
        },
        {
          href: "/dashboard/platform-analytics",
          label: "Platform Analytics",
          description: "Tenant and usage intelligence",
          icon: Gauge,
        },
        {
          href: "/dashboard/activity-logs",
          label: "Activity Logs",
          description: "System and audit trail",
          icon: Activity,
        },
        {
          href: "/dashboard/settings",
          label: "Settings",
          description: "Platform configuration",
          icon: Settings,
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
          href: "/dashboard/departments",
          label: "Departments",
          description: "Manage company units",
          icon: FolderKanban,
        },
        {
          href: "/dashboard/employees",
          label: "Employees",
          description: "Employee directory and scope",
          icon: UserRound,
        },
        {
          href: "/dashboard/team-leads",
          label: "Team Leads",
          description: "Leadership across departments",
          icon: Crown,
        },
        {
          href: "/dashboard/sprints",
          label: "Sprints",
          description: "Sprint and backlog controls",
          icon: Rocket,
        },
        {
          href: "/dashboard/tasks",
          label: "Tasks",
          description: "Task lifecycle operations",
          icon: SquareCheckBig,
        },
        {
          href: "/dashboard/reports",
          label: "Reports",
          description: "Performance and delivery reports",
          icon: FileText,
        },
        {
          href: "/dashboard/activity-logs",
          label: "Activity Logs",
          description: "Operational audit trail",
          icon: Activity,
        },
        {
          href: "/dashboard/settings",
          label: "Settings",
          description: "Workspace configuration",
          icon: Settings,
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
          href: "/dashboard/employees",
          label: "Employees",
          description: "Employees and team leads",
          icon: UserRound,
        },
        {
          href: "/dashboard/team-leads",
          label: "Team Leads",
          description: "Department leadership",
          icon: Target,
        },
        {
          href: "/dashboard/hr",
          label: "HR",
          description: "HR structure and staffing",
          icon: UserCog,
        },
        {
          href: "/dashboard/company-performance",
          label: "Company Performance",
          description: "Company-wide execution health",
          icon: BarChart3,
        },
        {
          href: "/dashboard/reports",
          label: "Reports",
          description: "Leadership reporting",
          icon: FileText,
        },
        {
          href: "/dashboard/settings",
          label: "Settings",
          description: "Company configuration",
          icon: Settings,
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
          href: "/dashboard/sprint-board",
          label: "Sprint Board",
          description: "Plan and track sprint flow",
          icon: Kanban,
        },
        {
          href: "/dashboard/tasks",
          label: "Tasks",
          description: "Department task operations",
          icon: SquareCheckBig,
        },
        {
          href: "/dashboard/team-members",
          label: "Team Members",
          description: "Manage your team members",
          icon: UserRoundPlus,
        },
        {
          href: "/dashboard/reports",
          label: "Reports",
          description: "Department delivery reports",
          icon: FileText,
        },
      ],
    },
  ],
  EMPLOYEE: [
    {
      title: "Main",
      items: [
        {
          href: "/dashboard/my-tasks",
          label: "My Tasks",
          description: "Assigned work and deadlines",
          icon: SquareCheckBig,
        },
        {
          href: "/dashboard/my-performance",
          label: "My Performance",
          description: "Personal output metrics",
          icon: BarChart3,
        },
        {
          href: "/dashboard/notifications",
          label: "Notifications",
          description: "Recent alerts and updates",
          icon: Bell,
        },
        {
          href: "/dashboard/settings",
          label: "Settings",
          description: "Personal preferences",
          icon: Settings,
        },
      ],
    },
  ],
  
};

const GLOBAL_ACCOUNT_SECTION: NavSection = {
  title: "Account",
  items: [
    {
      href: "/dashboard/change-password",
      label: "Change Password",
      description: "Protect your account",
      icon: LockKeyhole,
    },
  ],
};

export function DashboardSidebar({
  user,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: {
  user: SessionUser;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname() ?? "";
  const navSections = [...NAV_BY_ROLE[user.role], GLOBAL_ACCOUNT_SECTION];

  function isItemActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  }

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen flex-col border-r border-primary/20 bg-primary/95 p-4 text-primary-foreground transition-[width] duration-200",
        collapsed ? "w-24" : "w-80",
      )}
    >
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 p-3">
        <div className="rounded-full bg-primary-foreground p-2 text-primary">
          <LayoutGrid className="size-5" />
        </div>
        <div className={cn(collapsed && "hidden")}>
          <p className="text-xs uppercase tracking-wide text-primary-foreground/70">Control Center</p>
          <p className="text-sm font-semibold">Dashboard Workspace</p>
        </div>
      </div>

      <div className="mb-5 rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 p-3">
        <p className="text-xs text-primary-foreground/70">Role</p>
        <div className="mt-1">
          <Badge variant="secondary" className={cn(collapsed && "px-2 text-[10px]")}>{user.role}</Badge>
        </div>
        {!collapsed ? (
          <>
            <p className="mt-2 text-xs text-primary-foreground/70">Workspace</p>
            <p className="text-sm font-medium">{user.companyName}</p>
            {user.departmentName ? <Badge variant="outline" className="mt-2 border-primary-foreground/30 text-primary-foreground">{user.departmentName}</Badge> : null}
          </>
        ) : null}
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {navSections.map((section) => (
          <div key={section.title} className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/8 p-2">
            {!collapsed ? <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-primary-foreground/70">{section.title}</p> : null}
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
                      {!collapsed ? item.label : null}
                    </div>
                    {!collapsed ? (
                      <p className={cn("mt-0.5 text-xs", isActive ? "text-secondary-foreground/80" : "text-primary-foreground/70")}>
                        {item.description}
                      </p>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {onToggleCollapse ? (
        <Button variant="secondary" size="sm" className="mb-2 mt-4 w-full justify-center" onClick={onToggleCollapse}>
          {collapsed ? <UserCheck className="size-4" /> : <Handshake className="size-4" />}
          {!collapsed ? "Collapse" : null}
        </Button>
      ) : null}

      <Button
        variant="secondary"
        className="mt-1 w-full justify-start gap-2"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="size-4" />
        {!collapsed ? "Logout" : null}
      </Button>
    </aside>
  );
}
