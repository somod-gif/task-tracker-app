"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  Settings,
  Plus,
  Bell,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { getUserWorkspacesAction } from "@/server/actions/workspace-actions";
import { getUnreadCountAction } from "@/server/actions/notification-actions";
import { BrandLogo } from "@/components/branding/brand-logo";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";

type Workspace = { id: string; name: string; role: string };

type Props = {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string | null;
};

export function WorkspaceSidebar({ userName, userEmail, userAvatar }: Props) {
  const pathname = usePathname();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [unread, setUnread] = useState(0);

  // Active workspace id from path
  const match = pathname?.match(/\/workspace\/([^/]+)/);
  const activeId = match?.[1] ?? "";

  useEffect(() => {
    getUserWorkspacesAction().then((res) => {
      if (res.success && res.data) setWorkspaces(res.data as Workspace[]);
    });
    getUnreadCountAction().then((count) => {
      if (count.success) setUnread(count.data ?? 0);
    });
  }, []);

  const navItems = activeId
    ? [
        { label: "Boards", href: `/workspace/${activeId}`, icon: LayoutGrid },
        { label: "Members", href: `/workspace/${activeId}/members`, icon: Users },
        { label: "Settings", href: `/workspace/${activeId}/settings`, icon: Settings },
      ]
    : [];

  return (
    <aside
      className={cn(
        "flex h-screen w-64 flex-col border-r bg-card"
      )}
    >
      {/* Logo */}
      <div className="flex h-28 items-center justify-center border-b px-4">
        <BrandLogo href="/workspace" />
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {/* Workspace switcher */}
        <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Workspaces
        </p>

        {workspaces.map((ws) => (
          <Link
            key={ws.id}
            href={`/workspace/${ws.id}`}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
              ws.id === activeId
                ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium shadow-sm"
                : "text-foreground hover:bg-muted"
            )}
          >
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold",
                ws.id === activeId ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
              )}
            >
              {ws.name.charAt(0).toUpperCase()}
            </div>
            <span className="truncate">{ws.name}</span>
          </Link>
        ))}

        {/* Create workspace */}
        <CreateWorkspaceDialog
          onCreated={(id) => setWorkspaces((prev) => [...prev, { id, name: "New Workspace", role: "OWNER" }])}
        >
          <button
            className={cn(
              "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            )}
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>New workspace</span>
          </button>
        </CreateWorkspaceDialog>

        {/* Active workspace nav */}
        {navItems.length > 0 && (
          <>
            <div className="pt-3 pb-1">
              <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Navigate
              </p>
            </div>
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </>
        )}
      </div>

      {/* Bottom user row */}
      <div className="border-t p-2">
        <div className="flex items-center gap-2.5 rounded-lg p-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {userAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userAvatar} alt={userName} className="h-full w-full rounded-full object-cover" />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{userName}</p>
            <p className="truncate text-[10px] text-muted-foreground">{userEmail}</p>
          </div>
          <Link href="/workspace/notifications" className="relative rounded p-1 hover:bg-muted" title="Notifications">
            <Bell className="h-4 w-4" />
            {unread > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
