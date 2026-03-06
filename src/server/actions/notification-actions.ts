"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function getNotificationsAction() {
  try {
    const user = await requireAuth();

    const items = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
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

    return { success: true as const, data: items, error: "" };
  } catch {
    return { success: false as const, data: [], error: "Unauthorized" };
  }
}

export async function getUnreadCountAction() {
  try {
    const user = await requireAuth();
    const count = await prisma.notification.count({ where: { userId: user.id, isRead: false } });
    return { success: true as const, data: count, error: "" };
  } catch {
    return { success: false as const, data: 0, error: "Unauthorized" };
  }
}

export async function markNotificationAsReadAction(notificationId: string) {
  try {
    const user = await requireAuth();

    await prisma.notification.updateMany({
      where: { id: notificationId, userId: user.id },
      data: { isRead: true },
    });

    revalidatePath("/workspace");
    revalidatePath("/workspace/notifications");
    return { success: true as const, error: "" };
  } catch {
    return { success: false as const, error: "Unauthorized" };
  }
}

export async function markAllNotificationsAsReadAction() {
  try {
    const user = await requireAuth();

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    revalidatePath("/workspace");
    revalidatePath("/workspace/notifications");
    return { success: true as const, error: "" };
  } catch {
    return { success: false as const, error: "Unauthorized" };
  }
}
