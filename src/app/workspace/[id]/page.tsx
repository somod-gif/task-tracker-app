import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Plus, LayoutGrid, Users } from "lucide-react";

import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getWorkspaceBoardsAction } from "@/server/actions/board-actions";
import { CreateBoardDialog } from "@/components/workspace/create-board-dialog";
import { InviteMemberDialog } from "@/components/workspace/invite-member-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ id: string }> };

export default async function WorkspacePage({ params }: Props) {
  const { id: workspaceId } = await params;
  const user = await requireAuth().catch(() => null);
  if (!user) redirect("/login");

  // Check membership
  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId } },
    include: { workspace: true },
  });

  if (!membership) notFound();

  const workspace = membership.workspace;
  const boards = await getWorkspaceBoardsAction(workspaceId);
  const isManager = membership.role === "OWNER" || membership.role === "ADMIN";

  const BOARD_COLORS = [
    "from-[#1593c6] to-[#0f7ab8]",
    "from-[#262166] to-[#1a1560]",
    "from-emerald-500 to-emerald-600",
    "from-rose-500 to-rose-600",
    "from-amber-500 to-amber-600",
    "from-purple-500 to-purple-600",
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workspace.name}</h1>
          {workspace.description && (
            <p className="text-sm text-muted-foreground">{workspace.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/workspace/${workspaceId}/members`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Users className="h-4 w-4" /> Members
            </Button>
          </Link>
          {isManager && (
            <InviteMemberDialog workspaceId={workspaceId}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Invite
              </Button>
            </InviteMemberDialog>
          )}
          {isManager && (
            <CreateBoardDialog workspaceId={workspaceId}>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> New Board
              </Button>
            </CreateBoardDialog>
          )}
        </div>
      </div>

      {/* Boards */}
      {boards.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border">
          <LayoutGrid className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-base font-medium text-muted-foreground">No boards yet</p>
          {isManager && (
            <div className="mt-4">
              <CreateBoardDialog workspaceId={workspaceId}>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Create your first board
                </Button>
              </CreateBoardDialog>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {boards.map((board, i) => {
            const gradient = board.coverColor
              ? ""
              : BOARD_COLORS[i % BOARD_COLORS.length];

            return (
              <Link key={board.id} href={`/workspace/${workspaceId}/board/${board.id}`}>
                <div
                  className={`group relative h-32 cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br ${gradient} transition-all hover:shadow-lg hover:-translate-y-0.5`}
                  style={board.coverColor ? { backgroundColor: board.coverColor } : {}}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                  <div className="relative p-4">
                    <h3 className="font-semibold text-white text-base leading-tight line-clamp-2">
                      {board.title}
                    </h3>
                    {board.description && (
                      <p className="mt-1 text-xs text-white/70 line-clamp-1">{board.description}</p>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-black/20 text-white border-0"
                    >
                      {board.visibility.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Create new board tile */}
          {isManager && (
            <CreateBoardDialog workspaceId={workspaceId}>
              <button className="flex h-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border/60 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <div className="text-center">
                  <Plus className="mx-auto h-6 w-6" />
                  <p className="mt-1 text-sm font-medium">Create board</p>
                </div>
              </button>
            </CreateBoardDialog>
          )}
        </div>
      )}
    </div>
  );
}
