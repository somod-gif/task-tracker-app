/**
 * Edge-safe route constants — no Prisma, no bcrypt, no Node.js APIs.
 * Imported by middleware (Vercel Edge Function).
 */

export const PUBLIC_PATHS = [
  "/",
  "/about",
  "/services",
  "/testimonials",
  "/contact",
  "/login",
  "/register",
  "/api/auth",
  "/api/socket",
  "/_next",
  "/favicon.ico",
  "/invite",
];

/** Workspace-level role permission checks. Used in server actions. */
export function canManageWorkspace(role: string): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canDeleteWorkspace(role: string): boolean {
  return role === "OWNER";
}

export function canInviteMembers(role: string): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canCreateBoards(role: string): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageMembers(role: string): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canCreateDocs(role: string): boolean {
  return role === "PLATFORM_OWNER" || role === "ADMIN";
}
