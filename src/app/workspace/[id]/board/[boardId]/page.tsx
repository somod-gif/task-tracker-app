import { redirect, notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getBoardWithListsAction } from "@/server/actions/board-actions";
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "@/components/board/kanban-board";
import { BoardHeader } from "@/components/board/board-header";

type Props = { params: Promise<{ id: string; boardId: string }> };

export default async function BoardPage({ params }: Props) {
  const { id: workspaceId, boardId } = await params;
  const user = await requireAuth().catch(() => null);
  if (!user) redirect("/login");

  // Check workspace membership
  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId } },
    select: { role: true },
  });
  if (!membership) notFound();

  const board = await getBoardWithListsAction(workspaceId, boardId).catch(() => null);
  if (!board) notFound();

  // Get workspace members for assignee picker
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    orderBy: { joinedAt: "asc" },
  });

  const workspaceMembers = members.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
    avatar: m.user.avatar,
    role: m.role,
  }));

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <BoardHeader
        board={{ id: board.id, title: board.title, description: board.description ?? null, visibility: board.visibility as "PRIVATE" | "WORKSPACE", coverColor: board.coverColor ?? null }}
        members={workspaceMembers}
        canManage={membership.role === "OWNER" || membership.role === "ADMIN"}
        workspaceId={workspaceId}
      />
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          board={board}
          workspaceId={workspaceId}
          currentUserId={user.id}
          workspaceMembers={workspaceMembers}
          canManage={membership.role === "OWNER" || membership.role === "ADMIN"}
        />
      </div>
    </div>
  );
}
