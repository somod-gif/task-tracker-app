"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSocket } from "@/lib/socket/client";
import { appToast } from "@/lib/toast";

type NotificationItem = {
  id: string;
  type: "TASK_ASSIGNED" | "TASK_UPDATED" | "TASK_OVERDUE" | "SPRINT_ASSIGNED" | "COMPANY_APPROVED" | "SYSTEM";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications]);

  async function markRead(notificationId: string) {
    setNotifications((current) => current.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    });
  }

  async function markAllRead() {
    setNotifications((current) => current.map((n) => ({ ...n, isRead: true })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
  }

  useEffect(() => {
    let active = true;

    void (async () => {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (!active) {
        return;
      }
      if (response.ok) {
        const data = (await response.json()) as { items: NotificationItem[] };
        setNotifications(data.items);
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    let active = true;
    let cleanup: (() => void) | null = null;

    void getSocket(session.user.id).then((socket) => {
      if (!active) {
        return;
      }

      const onNotification = (payload: NotificationItem) => {
        setNotifications((current) => [{ ...payload, isRead: false }, ...current].slice(0, 10));
        appToast.info(`${payload.title}: ${payload.message}`);
      };

      socket.on("notification:new", onNotification);
      cleanup = () => {
        socket.off("notification:new", onNotification);
      };
    });

    return () => {
      active = false;
      cleanup?.();
    };
  }, [session?.user?.id]);

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((state) => !state)} className="relative">
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <Badge variant="destructive" className="absolute -right-2 -top-2 h-5 min-w-5 justify-center px-1">
            {unreadCount}
          </Badge>
        ) : null}
      </Button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-96 rounded-lg border bg-card p-3 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Notifications</p>
            <button className="text-xs text-muted-foreground hover:underline" onClick={() => void markAllRead()}>
              Mark all as read
            </button>
          </div>

          <div className="max-h-80 space-y-2 overflow-auto">
            {loading ? <p className="text-xs text-muted-foreground">Loading...</p> : null}
            {!loading && notifications.length === 0 ? <p className="text-xs text-muted-foreground">No notifications</p> : null}
            {notifications.slice(0, 10).map((item) => (
              <button
                key={item.id}
                onClick={() => void markRead(item.id)}
                className="w-full rounded-md border p-2 text-left hover:bg-muted"
              >
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  {!item.isRead ? <Badge variant="secondary">New</Badge> : null}
                </div>
                <p className="text-xs text-muted-foreground">{item.message}</p>
              </button>
            ))}
          </div>
          <div className="mt-3 border-t pt-2 text-right">
            <Link href="/dashboard/notifications" className="text-xs font-medium text-primary hover:underline" onClick={() => setOpen(false)}>
              View all
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
