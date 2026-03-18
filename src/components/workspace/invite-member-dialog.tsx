"use client";

import { ReactNode, useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteMemberAction } from "@/server/actions/invitation-actions";
import { appToast } from "@/lib/toast";

type Props = {
  workspaceId: string;
  children: ReactNode;
  onInvited?: () => void;
};

export function InviteMemberDialog({ workspaceId, children, onInvited }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    startTransition(async () => {
      const res = await inviteMemberAction({ workspaceId, email: email.trim(), role });
      if (res.success) {
        appToast.success(
          res.added ? "Member added to workspace" : "Invitation email sent!"
        );
        setOpen(false);
        setEmail("");
        onInvited?.();
      } else {
        appToast.error(res.error ?? "Failed to invite");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <p className="text-xs text-muted-foreground">
            If this person already has an account, they will be added immediately. Otherwise, they will receive an invite email.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email address *</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <div className="flex gap-2">
              {(["MEMBER", "ADMIN"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-md border py-1.5 text-sm transition-colors ${
                    role === r
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {r === "MEMBER" ? "Member" : "Admin"}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {role === "ADMIN"
                ? "Admins can manage boards, members, and workspace settings."
                : "Members can view and work on boards they have access to."}
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !email.trim()}>
              {isPending ? "Sending..." : "Send invite email"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
