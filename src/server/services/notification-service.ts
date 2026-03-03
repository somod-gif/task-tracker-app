import { prisma } from "@/lib/prisma";
import { emitNotificationToUser } from "@/lib/socket/server";
import { requireCompanyId, type SessionUser } from "@/lib/auth/session";
import { sendEmailToUser } from "@/lib/email/mailer";

export type NotificationType = "TASK_ASSIGNED" | "TASK_UPDATED" | "TASK_OVERDUE" | "SPRINT_ASSIGNED" | "COMPANY_APPROVED" | "SYSTEM";

export async function createNotification({
  userId,
  companyId,
  title,
  message,
  type = "SYSTEM",
}: {
  userId: string;
  companyId?: string;
  title: string;
  message: string;
  type?: NotificationType;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      read: false,
      ...(companyId ? ({ companyId } as Record<string, unknown>) : {}),
      type,
      isRead: false,
    } as never,
  });

  emitNotificationToUser(userId, {
    id: notification.id,
    userId,
    companyId: companyId ?? null,
    type,
    title,
    message,
    isRead: false,
    createdAt: notification.createdAt.toISOString(),
  });

  await sendEmailToUser({ userId, companyId, type, title, message });

  return notification;
}

export async function getUserNotifications(currentUser: SessionUser) {
  const companyId = requireCompanyId(currentUser);

  const items = await prisma.notification.findMany({
    where: {
      userId: currentUser.id,
      user: {
        companyId,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return items.map((item) => ({
    id: item.id,
    userId: item.userId,
    companyId,
    title: item.title,
    message: item.message,
    type: ((item as unknown as { type?: NotificationType }).type ?? "SYSTEM") as NotificationType,
    isRead: (item as unknown as { isRead?: boolean }).isRead ?? item.read,
    createdAt: item.createdAt,
  }));
}

export async function getUnreadNotificationCount(currentUser: SessionUser) {
  const companyId = requireCompanyId(currentUser);

  return prisma.notification.count({
    where: {
      userId: currentUser.id,
      read: false,
      user: {
        companyId,
      },
    },
  });
}

export async function markNotificationAsRead(currentUser: SessionUser, notificationId: string) {
  const companyId = requireCompanyId(currentUser);

  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: currentUser.id,
      user: {
        companyId,
      },
    },
    data: {
      read: true,
      isRead: true,
    },
  });
}

export async function markAllNotificationsAsRead(currentUser: SessionUser) {
  const companyId = requireCompanyId(currentUser);

  return prisma.notification.updateMany({
    where: {
      userId: currentUser.id,
      user: {
        companyId,
      },
    },
    data: {
      read: true,
      isRead: true,
    },
  });
}
