import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { WorkspaceRole } from "@/types/domain";

export {
  canManageWorkspace,
  canDeleteWorkspace,
  canInviteMembers,
  canCreateBoards,
  canManageMembers,
  canCreateDocs,
} from "@/lib/rbac/paths";

export async function requireWorkspaceMember(
  workspaceId: string,
  requiredRoles?: WorkspaceRole[]
) {
  const user = await requireAuth();

  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId } },
    select: { role: true },
  });

  if (!membership) {
    throw new Error("Forbidden: not a workspace member");
  }

  if (requiredRoles && !requiredRoles.includes(membership.role as WorkspaceRole)) {
    throw new Error("Forbidden: insufficient workspace role");
  }

  return { user, role: membership.role as WorkspaceRole };
}

