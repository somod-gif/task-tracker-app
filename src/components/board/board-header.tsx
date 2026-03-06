"use client";

import Link from "next/link";
import { ArrowLeft, Globe, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

type Board = { id: string; title: string; description: string | null; visibility: "PRIVATE" | "WORKSPACE"; coverColor: string | null };
type Member = { id: string; name: string; avatar: string | null; role: string };

type Props = {
  board: Board;
  workspaceId: string;
  members: Member[];
  canManage: boolean;
  onInvite?: () => void;
};

export function BoardHeader({ board, workspaceId, members, canManage, onInvite }: Props) {
  return (
    <div
      className="sticky top-0 z-10 flex items-center gap-3 border-b bg-gradient-to-r from-background to-primary/5 px-4 py-3 backdrop-blur-sm"
      style={board.coverColor ? { borderBottomColor: board.coverColor + "60" } : undefined}
    >
      {/* Back */}
      <Link
        href={`/workspace/${workspaceId}`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Boards</span>
      </Link>

      {/* Divider */}
      <span className="text-border">|</span>

      {/* Title */}
      <div className="flex items-center gap-2">
        {board.coverColor && (
          <div className="h-5 w-5 rounded" style={{ backgroundColor: board.coverColor }} />
        )}
        <h1 className="text-base font-semibold">{board.title}</h1>
        <span
          className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] text-primary"
          title={board.visibility === "PRIVATE" ? "Only members can view" : "Visible to workspace members"}
        >
          {board.visibility === "PRIVATE" ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
          {board.visibility === "PRIVATE" ? "Private" : "Workspace"}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Member avatars */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {members.slice(0, 5).map((m) => (
            <div
              key={m.id}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground ring-2 ring-background"
              title={`${m.name} (${m.role})`}
            >
              {m.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.avatar} alt={m.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                m.name.charAt(0).toUpperCase()
              )}
            </div>
          ))}
          {members.length > 5 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] text-muted-foreground ring-2 ring-background">
              +{members.length - 5}
            </div>
          )}
        </div>

        {canManage && (
          <Button variant="outline" size="sm" onClick={onInvite} className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Invite</span>
          </Button>
        )}
      </div>
    </div>
  );
}
