import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/session";
import {
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/server/services/notification-service";

export async function GET() {
  try {
    const user = await requireAuth();
    const [items, unread] = await Promise.all([getUserNotifications(user), getUnreadNotificationCount(user)]);

    return NextResponse.json({ items, unread });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const body = (await request.json()) as { notificationId?: string; markAll?: boolean };

    if (body.markAll) {
      await markAllNotificationsAsRead(user);
    } else if (body.notificationId) {
      await markNotificationAsRead(user, body.notificationId);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
