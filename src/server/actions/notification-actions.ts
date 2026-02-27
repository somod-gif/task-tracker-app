"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/session";
import { markAllNotificationsAsRead, markNotificationAsRead } from "@/server/services/notification-service";

export async function markNotificationAsReadAction(notificationId: string) {
  const user = await requireAuth();
  await markNotificationAsRead(user, notificationId);
  revalidatePath("/dashboard");
}

export async function markAllNotificationsAsReadAction() {
  const user = await requireAuth();
  await markAllNotificationsAsRead(user);
  revalidatePath("/dashboard");
}
