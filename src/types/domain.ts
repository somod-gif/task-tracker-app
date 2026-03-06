// ─── Workspace Roles ────────────────────────────────────────────────────────
export const WORKSPACE_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

// ─── Board Visibility ────────────────────────────────────────────────────────
export const BOARD_VISIBILITIES = ["PRIVATE", "WORKSPACE"] as const;
export type BoardVisibility = (typeof BOARD_VISIBILITIES)[number];

// ─── Card Priority ───────────────────────────────────────────────────────────
export const CARD_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type CardPriority = (typeof CARD_PRIORITIES)[number];

// ─── Notification Types ──────────────────────────────────────────────────────
export const NOTIFICATION_TYPES = [
  "WORKSPACE_INVITE",
  "BOARD_ADDED",
  "CARD_ASSIGNED",
  "CARD_COMMENT",
  "DUE_DATE_REMINDER",
  "LOGIN",
  "SYSTEM",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// ─── Permission helpers ──────────────────────────────────────────────────────
export function canManageWorkspace(role: WorkspaceRole) {
  return role === "OWNER" || role === "ADMIN";
}

export function canDeleteWorkspace(role: WorkspaceRole) {
  return role === "OWNER";
}

export function canInviteMembers(role: WorkspaceRole) {
  return role === "OWNER" || role === "ADMIN";
}

export function canCreateBoards(role: WorkspaceRole) {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageMembers(role: WorkspaceRole) {
  return role === "OWNER" || role === "ADMIN";
}
