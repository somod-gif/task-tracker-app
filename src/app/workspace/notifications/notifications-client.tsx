"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: Date | string;
  workspaceId: string | null;
};

export function NotificationsClient({ initialItems }: { initialItems: NotificationItem[] }) {
  const [items, setItems] = useState<NotificationItem[]>(initialItems ?? []);

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  async function markOneAsRead(notificationId: string) {
    setItems((current) => current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)));

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    });
  }

  async function markAllAsRead() {
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));

    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
  }

  return (
    <section className="rounded-2xl border bg-card p-4 shadow-md md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium">Unread: {unreadCount}</p>
        </div>

        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void markAllAsRead()}>
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className={`rounded-xl border p-4 ${item.isRead ? "bg-background" : "bg-primary/5 border-primary/30"}`}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{item.title}</p>
                {!item.isRead ? <Badge variant="secondary">New</Badge> : null}
              </div>

              <p className="text-sm text-muted-foreground">{item.message}</p>

              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()}
                </p>

                <div className="flex items-center gap-2">
                  {item.link ? (
                    <Link href={item.link} className="text-xs font-medium text-primary hover:underline">
                      Open
                    </Link>
                  ) : null}

                  {!item.isRead ? (
                    <button
                      onClick={() => void markOneAsRead(item.id)}
                      className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
