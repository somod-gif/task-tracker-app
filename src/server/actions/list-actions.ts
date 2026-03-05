"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/rbac";

// ─── Create List ───────────────────────────────────────────────────────────────
export async function createListAction(workspaceId: string, boardId: string, title: string) {
  await requireWorkspaceMember(workspaceId);

  const lastList = await prisma.list.findFirst({
    where: { boardId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const list = await prisma.list.create({
    data: { boardId, title: title.trim(), order: (lastList?.order ?? -1) + 1 },
    select: { id: true, title: true, order: true },
  });

  revalidatePath(`/workspace/${workspaceId}/board/${boardId}`);
  return { success: true, list };
}

// ─── Update List ───────────────────────────────────────────────────────────────
export async function updateListAction(workspaceId: string, listId: string, title: string) {
  await requireWorkspaceMember(workspaceId);

  const list = await prisma.list.update({
    where: { id: listId },
    data: { title: title.trim() },
    select: { boardId: true },
  });

  revalidatePath(`/workspace/${workspaceId}/board/${list.boardId}`);
  return { success: true };
}

// ─── Delete List ───────────────────────────────────────────────────────────────
export async function deleteListAction(workspaceId: string, listId: string) {
  await requireWorkspaceMember(workspaceId, ["OWNER", "ADMIN"]);

  const list = await prisma.list.delete({
    where: { id: listId },
    select: { boardId: true },
  });

  revalidatePath(`/workspace/${workspaceId}/board/${list.boardId}`);
  return { success: true };
}

// ─── Reorder Lists ─────────────────────────────────────────────────────────────
export async function reorderListsAction(
  workspaceId: string,
  boardId: string,
  orderedListIds: string[]
) {
  await requireWorkspaceMember(workspaceId);

  const updates = orderedListIds.map((id, index) =>
    prisma.list.update({ where: { id }, data: { order: index } })
  );

  await prisma.$transaction(updates);
  revalidatePath(`/workspace/${workspaceId}/board/${boardId}`);
  return { success: true };
}

// ─── Move Card Between Lists ───────────────────────────────────────────────────
const moveCardSchema = z.object({
  workspaceId: z.string().cuid(),
  boardId: z.string().cuid(),
  cardId: z.string().cuid(),
  sourceListId: z.string().cuid(),
  destinationListId: z.string().cuid(),
  destinationIndex: z.number().int().min(0),
});

export async function moveCardAction(input: z.infer<typeof moveCardSchema>) {
  const parsed = moveCardSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  await requireWorkspaceMember(parsed.data.workspaceId);

  const { cardId, destinationListId, destinationIndex, boardId, workspaceId } = parsed.data;

  // Get current cards in destination list ordered
  const destCards = await prisma.card.findMany({
    where: { listId: destinationListId },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });

  // Remove the moving card from the dest list (if same list)
  const filteredCards = destCards.filter((c) => c.id !== cardId);

  // Insert at destination index
  filteredCards.splice(destinationIndex, 0, { id: cardId, order: destinationIndex });

  const updates = filteredCards.map((card, index) =>
    prisma.card.update({ where: { id: card.id }, data: { order: index, listId: destinationListId } })
  );

  await prisma.$transaction(updates);
  revalidatePath(`/workspace/${workspaceId}/board/${boardId}`);
  return { success: true };
}
