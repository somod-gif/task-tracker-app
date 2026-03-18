"use client";

import { useState, useTransition } from "react";
import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { removeMemberAction, updateMemberRoleAction } from "@/server/actions/workspace-actions";
import { InviteMemberDialog } from "@/components/workspace/invite-member-dialog";
import { appToast } from "@/lib/toast";

type Member = { id: string; name: string; email: string; avatar: string | null; role: string; joinedAt: Date };

type Props = {
  workspaceId: string;
  workspaceName: string;
  members: Member[];
  currentUserId: string;
  currentUserRole: string;
  canManage: boolean;
};

const ROLE_LABELS: Record<string, string> = { OWNER: "Owner", ADMIN: "Admin", MEMBER: "Member" };
const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-amber-100 text-amber-700",
  ADMIN: "bg-blue-100 text-blue-700",
  MEMBER: "bg-slate-100 text-slate-600",
};

export function MembersClient({ workspaceId, workspaceName, members: initial, currentUserId, canManage }: Props) {
  const [members, setMembers] = useState(initial);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRemove(memberId: string) {
    const member = members.find((m) => m.id === memberId) ?? null;
    setMemberToRemove(member);
  }

  function confirmRemove() {
    if (!memberToRemove) return;

    startTransition(async () => {
      const res = await removeMemberAction({ workspaceId, memberId: memberToRemove.id });
      if (res.success) {
        setMembers((prev) => prev.filter((m) => m.id !== memberToRemove.id));
        setMemberToRemove(null);
        appToast.success("Member removed");
      } else {
        appToast.error(res.error ?? "Failed");
      }
    });
  }

  function handleRoleChange(memberId: string, newRole: string) {
    startTransition(async () => {
      const res = await updateMemberRoleAction({ workspaceId, memberId, role: newRole as "ADMIN" | "MEMBER" });
      if (res.success) {
        setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role: newRole } : m));
        appToast.success("Role updated");
      } else {
        appToast.error(res.error ?? "Failed");
      }
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workspaceName}</h1>
          <p className="text-sm text-muted-foreground mt-1">{members.length} member{members.length !== 1 ? "s" : ""}</p>
          <p className="mt-1 text-xs text-muted-foreground">Manage who has access and what permissions they have in this workspace.</p>
        </div>
        {canManage && (
          <InviteMemberDialog workspaceId={workspaceId} onInvited={() => window.location.reload()}>
            <Button>Invite member</Button>
          </InviteMemberDialog>
        )}
      </div>

      <div className="mb-4 rounded-lg border bg-card/70 p-3 text-sm text-muted-foreground">
        <p><span className="font-medium text-foreground">Owner:</span> full control, including deleting workspace.</p>
        <p><span className="font-medium text-foreground">Admin:</span> can manage members and workspace settings.</p>
        <p><span className="font-medium text-foreground">Member:</span> can collaborate on boards and tasks.</p>
      </div>

      <div className="rounded-xl border divide-y">
        {members.map((m) => {
          const isCurrentUser = m.id === currentUserId;
          const isOwner = m.role === "OWNER";
          const canEditThis = canManage && !isOwner && !isCurrentUser;

          return (
            <div key={m.id} className="flex items-center gap-4 px-4 py-3">
              {/* Avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {m.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.avatar} alt={m.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  m.name.charAt(0).toUpperCase()
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {m.name} {isCurrentUser && <span className="text-muted-foreground text-xs">(you)</span>}
                </p>
                <p className="text-xs text-muted-foreground truncate">{m.email}</p>
              </div>

              {/* Role */}
              {canEditThis ? (
                <select
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.id, e.target.value)}
                  disabled={isPending}
                  className="rounded-md border border-input bg-background px-2 py-1 text-xs focus:ring-2 focus:ring-primary"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              ) : (
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_COLORS[m.role] ?? "bg-slate-100"}`}>
                  {ROLE_LABELS[m.role] ?? m.role}
                </span>
              )}

              {/* Remove */}
              {canEditThis && (
                              <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(m.id)}
                  disabled={isPending}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={Boolean(memberToRemove)}
        onOpenChange={(open) => {
          if (!open) setMemberToRemove(null);
        }}
        title={memberToRemove ? `Remove ${memberToRemove.name}?` : "Remove member?"}
        description="This member will lose access to this workspace immediately."
        confirmLabel="Remove member"
        destructive
        loading={isPending}
        onConfirm={confirmRemove}
      />
    </div>
  );
}
