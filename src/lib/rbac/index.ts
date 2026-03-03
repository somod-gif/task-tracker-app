import type { Role } from "@/types/domain";

import { requireAuth } from "@/lib/auth/session";

export const PUBLIC_PATHS = [
  "/",
  "/about",
  "/services",
  "/testimonials",
  "/contact",
  "/login",
  "/api/auth",
  "/api/socket",
  "/_next",
  "/favicon.ico",
];

export const dashboardByRole: Record<Role, string> = {
  PLATFORM_OWNER: "/dashboard",
  SUPER_ADMIN: "/dashboard",
  ADMIN: "/dashboard",
  DEPARTMENT_LEAD: "/dashboard",
  EMPLOYEE: "/dashboard",
};

const PATH_ROLE_ACCESS: Record<string, Role[]> = {
  "/dashboard/platform-owner": ["PLATFORM_OWNER"],
  "/dashboard/super-admin": ["SUPER_ADMIN"],
  "/dashboard/admin": ["ADMIN", "SUPER_ADMIN"],
  "/dashboard/team-lead": ["DEPARTMENT_LEAD"],
  "/dashboard/department-lead": ["DEPARTMENT_LEAD"],
  "/dashboard/pending-approvals": ["PLATFORM_OWNER"],
  "/dashboard/users-overview": ["PLATFORM_OWNER"],
  "/dashboard/platform-analytics": ["PLATFORM_OWNER"],
  "/dashboard/departments": ["SUPER_ADMIN", "ADMIN"],
  "/dashboard/employees": ["SUPER_ADMIN", "ADMIN"],
  "/dashboard/sprints": ["SUPER_ADMIN", "ADMIN"],
  "/dashboard/tasks": ["SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD"],
  "/dashboard/reports": ["SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD"],
  "/dashboard/hr": ["ADMIN"],
  "/dashboard/company-performance": ["ADMIN"],
  "/dashboard/sprint-board": ["DEPARTMENT_LEAD"],
  "/dashboard/team-members": ["DEPARTMENT_LEAD"],
  "/dashboard/my-tasks": ["EMPLOYEE"],
  "/dashboard/my-performance": ["EMPLOYEE"],
  "/dashboard/notifications": ["PLATFORM_OWNER", "SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD", "EMPLOYEE"],
  "/dashboard/activity-logs": ["PLATFORM_OWNER", "SUPER_ADMIN"],
  "/dashboard/settings": ["PLATFORM_OWNER", "SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD", "EMPLOYEE"],
  "/dashboard/companies": ["PLATFORM_OWNER", "SUPER_ADMIN", "ADMIN"],
  "/dashboard/users": ["PLATFORM_OWNER", "SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD"],
  "/dashboard/team-leads": ["SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD"],
  "/dashboard/employee": ["EMPLOYEE"],
  "/dashboard/change-password": ["PLATFORM_OWNER", "SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD", "EMPLOYEE"],
  "/dashboard": ["PLATFORM_OWNER", "SUPER_ADMIN", "ADMIN", "DEPARTMENT_LEAD", "EMPLOYEE"],
};

export function isAllowedForPath(pathname: string, role: string): boolean {
  const match = Object.entries(PATH_ROLE_ACCESS)
    .sort(([firstPath], [secondPath]) => secondPath.length - firstPath.length)
    .find(([path]) => pathname.startsWith(path));
  if (!match) {
    return false;
  }

  return match[1].includes(role as Role);
}

export async function requireRole(roles: Role[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}
