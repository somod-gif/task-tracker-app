import { prisma } from "@/lib/prisma";
import { emitNotificationToUser } from "@/lib/socket/server";
import { requireCompanyId, type SessionUser } from "@/lib/auth/session";
import { sendEmailToUser } from "@/lib/email/mailer";

export async function createNotification(userId: string, title: string, message: string) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
    },
  });

  emitNotificationToUser(userId, {
    id: notification.id,
    userId,
    title,
    message,
    createdAt: notification.createdAt.toISOString(),
  });

  await sendEmailToUser(userId, `[Sprint Desk] ${title}`, message);

  return notification;
}

export async function getUserNotifications(currentUser: SessionUser) {
  const companyId = requireCompanyId(currentUser);

  return prisma.notification.findMany({
    where: {
      userId: currentUser.id,
      user: {
        companyId,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
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
    },
  });
}
