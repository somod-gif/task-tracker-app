import type { Role } from "@/types/domain";

import { requireAuth } from "@/lib/auth/session";

export { PUBLIC_PATHS, dashboardByRole, isAllowedForPath } from "@/lib/rbac/paths";

export async function requireRole(roles: Role[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}
