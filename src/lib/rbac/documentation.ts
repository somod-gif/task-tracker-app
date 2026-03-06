export type DocumentationRole = "PLATFORM_OWNER" | "ADMIN" | "USER";

export function canCreateDocumentation(role: DocumentationRole): boolean {
  return role === "PLATFORM_OWNER" || role === "ADMIN";
}

export function resolveDocumentationRole(params: {
  email?: string | null;
  isAdminSession?: boolean;
}): DocumentationRole {
  const ownerEmail = (process.env.BOOTSTRAP_PLATFORM_OWNER_EMAIL ?? "platform@sprintdesk.local").toLowerCase();
  const normalizedEmail = params.email?.toLowerCase();

  if (normalizedEmail && normalizedEmail === ownerEmail) {
    return "PLATFORM_OWNER";
  }

  if (params.isAdminSession) {
    return "ADMIN";
  }

  return "USER";
}

export function assertCanCreateDocumentation(role: DocumentationRole) {
  if (!canCreateDocumentation(role)) {
    throw new Error("Forbidden: insufficient documentation role");
  }
}
