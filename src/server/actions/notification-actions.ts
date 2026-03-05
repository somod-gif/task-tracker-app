"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function getNotificationsAction() {
  const user = await requireAuth();

  return prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      isRead: true,
      link: true,
      createdAt: true,
      workspaceId: true,
    },
  });
}

export async function getUnreadCountAction() {
  const user = await requireAuth();
  return prisma.notification.count({ where: { userId: user.id, isRead: false } });
}

export async function markNotificationAsReadAction(notificationId: string) {
  const user = await requireAuth();

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { isRead: true },
  });

  revalidatePath("/workspace");
}

export async function markAllNotificationsAsReadAction() {
  const user = await requireAuth();

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/workspace");
}

