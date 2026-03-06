import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/session";
import { getNotificationsAction } from "@/server/actions/notification-actions";
import { NotificationsClient } from "@/app/workspace/notifications/notifications-client";

export default async function WorkspaceNotificationsPage() {
  const user = await requireAuth().catch(() => null);
  if (!user) redirect("/login");

  const response = await getNotificationsAction();

  return (
    <main className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Stay updated on card assignments, comments, invites, and account activity.</p>
        </div>

        <NotificationsClient initialItems={response.data} />
      </div>
    </main>
  );
}
