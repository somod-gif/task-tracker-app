"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { acceptInvitationAction } from "@/server/actions/invitation-actions";
import { appToast } from "@/lib/toast";

type Props = {
  token: string;
  workspaceName: string;
  workspaceId: string;
  inviterName: string;
  invitedEmail: string;
  currentUserEmail: string;
};

export function AcceptInviteClient({ token, workspaceName, workspaceId, inviterName, invitedEmail, currentUserEmail }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const emailMismatch = invitedEmail.toLowerCase() !== currentUserEmail.toLowerCase();

  function handleAccept() {
    startTransition(async () => {
      const res = await acceptInvitationAction(token);
      if (res.success) {
        appToast.success(`Joined ${workspaceName}!`);
        router.push(`/workspace/${workspaceId}`);
      } else {
        appToast.error(res.error ?? "Failed to accept invitation");
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#262166]/5 to-[#1593c6]/5 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-lg text-center space-y-5">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
          {workspaceName.charAt(0).toUpperCase()}
        </div>

        <div>
          <h1 className="text-xl font-bold">You&apos;ve been invited!</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{inviterName}</span> invited you to join{" "}
            <span className="font-medium text-foreground">{workspaceName}</span>.
          </p>
        </div>

        {emailMismatch && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-left">
            <p className="text-sm text-amber-700">
              This invitation was sent to <strong>{invitedEmail}</strong> but you&apos;re signed in as{" "}
              <strong>{currentUserEmail}</strong>. You can still accept, but make sure this is the right account.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.push("/workspace")} disabled={isPending}>
            Decline
          </Button>
          <Button className="flex-1" onClick={handleAccept} disabled={isPending}>
            {isPending ? "Joining..." : "Accept invitation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
