"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/rbac";
import type { CardPriority } from "@/types/domain";
import { emitNotification } from "@/lib/socket";

// ─── Create Card ───────────────────────────────────────────────────────────────
export async function createCardAction(
  workspaceId: string,
  listId: string,
  title: string
) {
  await requireWorkspaceMember(workspaceId);

  const list = await prisma.list.findUnique({ where: { id: listId }, select: { boardId: true } });
  if (!list) return { success: false, error: "List not found" };

  const lastCard = await prisma.card.findFirst({
    where: { listId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const card = await prisma.card.create({
    data: { listId, title: title.trim(), order: (lastCard?.order ?? -1) + 1 },
    select: { id: true, title: true, order: true },
  });

  revalidatePath(`/workspace/${workspaceId}/board/${list.boardId}`);
  return { success: true, card };
}

// ─── Get Card Detail ───────────────────────────────────────────────────────────
export async function getCardDetailAction(workspaceId: string, cardId: string) {
  await requireWorkspaceMember(workspaceId);

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      list: { select: { id: true, title: true, boardId: true } },
      assignments: {
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
      },
      comments: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "asc" },
      },
      activityLogs: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!card) throw new Error("Card not found");
  return card;
}

// ─── Update Card ───────────────────────────────────────────────────────────────
const updateCardSchema = z.object({
  cardId: z.string().cuid(),
  workspaceId: z.string().cuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  coverColor: z.string().optional(),
});

export async function updateCardAction(data: z.infer<typeof updateCardSchema>) {
  const parsed = updateCardSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const { user } = await requireWorkspaceMember(parsed.data.workspaceId);

  const card = await prisma.card.update({
    where: { id: parsed.data.cardId },
    data: {
      ...(parsed.data.title && { title: parsed.data.title }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...(parsed.data.dueDate !== undefined && {
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      }),
      ...(parsed.data.priority && { priority: parsed.data.priority as CardPriority }),
      ...(parsed.data.coverColor !== undefined && { coverColor: parsed.data.coverColor }),
    },
    select: { listId: true, list: { select: { boardId: true } } },
  });

  // Activity log
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      workspaceId: parsed.data.workspaceId,
      boardId: card.list.boardId,
      cardId: parsed.data.cardId,
      action: "CARD_UPDATED",
      description: `Card updated`,
    },
  });

  revalidatePath(`/workspace/${parsed.data.workspaceId}/board/${card.list.boardId}`);
  return { success: true };
}

// ─── Delete Card ───────────────────────────────────────────────────────────────
export async function deleteCardAction(workspaceId: string, cardId: string) {
  await requireWorkspaceMember(workspaceId);

  const card = await prisma.card.delete({
    where: { id: cardId },
    select: { list: { select: { boardId: true } } },
  });

  revalidatePath(`/workspace/${workspaceId}/board/${card.list.boardId}`);
  return { success: true };
}

// ─── Assign Member to Card ─────────────────────────────────────────────────────
export async function assignMemberToCardAction(
  workspaceId: string,
  cardId: string,
  targetUserId: string
) {
  const { user } = await requireWorkspaceMember(workspaceId);

  // Ensure target is workspace member
  const targetMember = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    select: { userId: true },
  });
  if (!targetMember) return { success: false, error: "User is not a workspace member" };

  await prisma.cardAssignment.upsert({
    where: { cardId_userId: { cardId, userId: targetUserId } },
    create: { cardId, userId: targetUserId },
    update: {},
  });

  // Notify target user
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { title: true, list: { select: { board: { select: { id: true, title: true } } } } },
  });

  if (card && targetUserId !== user.id) {
    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        workspaceId,
        type: "CARD_ASSIGNED",
        title: "You were assigned to a card",
        message: `You were assigned to "${card.title}" on board "${card.list.board.title}"`,
        link: `/workspace/${workspaceId}/board/${card.list.board.id}`,
      },
    });

    await emitNotification(targetUserId, {
      id: notification.id,
      userId: targetUserId,
      workspaceId,
      type: "CARD_ASSIGNED",
      title: notification.title,
      message: notification.message,
      isRead: false,
      link: notification.link,
      createdAt: notification.createdAt.toISOString(),
    });
  }

  revalidatePath(`/workspace/${workspaceId}/board/${card?.list.board.id ?? ""}`);
  return { success: true };
}

// ─── Unassign Member from Card ─────────────────────────────────────────────────
export async function unassignMemberFromCardAction(
  workspaceId: string,
  cardId: string,
  targetUserId: string
) {
  await requireWorkspaceMember(workspaceId);

  await prisma.cardAssignment.deleteMany({
    where: { cardId, userId: targetUserId },
  });

  return { success: true };
}

// ─── Add Comment ───────────────────────────────────────────────────────────────
export async function addCardCommentAction(
  workspaceId: string,
  cardId: string,
  content: string
) {
  if (!content.trim()) return { success: false, error: "Comment cannot be empty" };

  const { user } = await requireWorkspaceMember(workspaceId);

  const comment = await prisma.cardComment.create({
    data: { cardId, userId: user.id, content: content.trim() },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  // Notify card assignees (except commenter)
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: {
      title: true,
      assignments: { select: { userId: true } },
      list: { select: { board: { select: { id: true, title: true } } } },
    },
  });

  if (card) {
    const uniqueUserIds = [...new Set(card.assignments.map((a) => a.userId))].filter(
      (uid) => uid !== user.id
    );

    for (const uid of uniqueUserIds) {
      const notification = await prisma.notification.create({
        data: {
          userId: uid,
          workspaceId,
          type: "CARD_COMMENT",
          title: "New comment on your card",
          message: `${user.name} commented on "${card.title}"`,
          link: `/workspace/${workspaceId}/board/${card.list.board.id}`,
        },
      });

      await emitNotification(uid, {
        id: notification.id,
        userId: uid,
        workspaceId,
        type: "CARD_COMMENT",
        title: notification.title,
        message: notification.message,
        isRead: false,
        link: notification.link,
        createdAt: notification.createdAt.toISOString(),
      });
    }
  }

  const boardId = card?.list.board.id;
  if (boardId) revalidatePath(`/workspace/${workspaceId}/board/${boardId}`);

  return { success: true, comment };
}
