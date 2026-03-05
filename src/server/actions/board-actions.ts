"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/rbac";
import type { BoardVisibility } from "@/types/domain";

// ─── Create Board ──────────────────────────────────────────────────────────────
const createBoardSchema = z.object({
  workspaceId: z.string().cuid(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  visibility: z.enum(["PRIVATE", "WORKSPACE"]).default("WORKSPACE"),
  coverColor: z.string().optional(),
});

export async function createBoardAction(input: z.infer<typeof createBoardSchema>) {
  const parsed = createBoardSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors.title?.[0] ?? "Invalid input" };
  }

  const { user } = await requireWorkspaceMember(parsed.data.workspaceId, ["OWNER", "ADMIN"]);

  const board = await prisma.board.create({
    data: {
      workspaceId: parsed.data.workspaceId,
      title: parsed.data.title,
      description: parsed.data.description,
      visibility: parsed.data.visibility as BoardVisibility,
      coverColor: parsed.data.coverColor,
      createdById: user.id,
    },
    select: { id: true },
  });

  // Seed with default lists
  await prisma.list.createMany({
    data: [
      { boardId: board.id, title: "To Do", order: 0 },
      { boardId: board.id, title: "In Progress", order: 1 },
      { boardId: board.id, title: "Done", order: 2 },
    ],
  });

  revalidatePath(`/workspace/${parsed.data.workspaceId}`);
  return { success: true, error: "", data: board };
}

// ─── Get Boards for Workspace ──────────────────────────────────────────────────
export async function getWorkspaceBoardsAction(workspaceId: string) {
  const { user } = await requireWorkspaceMember(workspaceId);

  const boards = await prisma.board.findMany({
    where: {
      workspaceId,
      OR: [
        { visibility: "WORKSPACE" },
        { visibility: "PRIVATE", createdById: user.id },
      ],
    },
    include: {
      _count: {
        select: {
          lists: true,
        },
      },
      createdBy: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return boards;
}

// ─── Get Board with Lists + Cards ──────────────────────────────────────────────
export async function getBoardWithListsAction(workspaceId: string, boardId: string) {
  await requireWorkspaceMember(workspaceId);

  const board = await prisma.board.findFirst({
    where: { id: boardId, workspaceId },
    include: {
      lists: {
        orderBy: { order: "asc" },
        include: {
          cards: {
            orderBy: { order: "asc" },
            include: {
              assignments: {
                include: { user: { select: { id: true, name: true, avatar: true } } },
              },
              _count: { select: { comments: true } },
            },
          },
        },
      },
      createdBy: { select: { id: true, name: true, avatar: true } },
    },
  });

  if (!board) throw new Error("Board not found");
  return board;
}

// ─── Update Board ──────────────────────────────────────────────────────────────
export async function updateBoardAction(boardId: string, workspaceId: string, data: {
  title?: string;
  description?: string;
  visibility?: BoardVisibility;
  coverColor?: string;
}) {
  await requireWorkspaceMember(workspaceId, ["OWNER", "ADMIN"]);

  await prisma.board.update({ where: { id: boardId }, data });
  revalidatePath(`/workspace/${workspaceId}/board/${boardId}`);
  return { success: true };
}

// ─── Delete Board ──────────────────────────────────────────────────────────────
export async function deleteBoardAction(boardId: string, workspaceId: string) {
  await requireWorkspaceMember(workspaceId, ["OWNER", "ADMIN"]);

  await prisma.board.delete({ where: { id: boardId } });
  revalidatePath(`/workspace/${workspaceId}`);
  return { success: true };
}
