import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { canManageMembers } from "@/types/domain";
import { MembersClient } from "./members-client";

type Props = { params: Promise<{ id: string }> };

export default async function MembersPage({ params }: Props) {
  const { id: workspaceId } = await params;
  const session = await requireAuth();

  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.id, workspaceId } },
    include: { workspace: true },
  });

  if (!membership) redirect("/workspace");

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    orderBy: { joinedAt: "asc" },
  });

  const canManage = canManageMembers(membership.role as "OWNER" | "ADMIN" | "MEMBER");

  return (
    <MembersClient
      workspaceId={workspaceId}
      workspaceName={membership.workspace.name}
      members={members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        role: m.role,
        joinedAt: m.joinedAt,
      }))}
      currentUserId={session.id}
      currentUserRole={membership.role}
      canManage={canManage}
    />
  );
}
