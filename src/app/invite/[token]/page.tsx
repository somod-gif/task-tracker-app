import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { AcceptInviteClient } from "./accept-invite-client";

type Props = { params: Promise<{ token: string }> };

export default async function InvitePage({ params }: Props) {
  const { token } = await params;

  // Check invitation validity
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { workspace: { select: { id: true, name: true } }, sentBy: { select: { name: true } } },
  });

  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold">Invalid invitation</h1>
          <p className="text-muted-foreground">This invitation link is not valid or has already been used.</p>
          <Link href="/workspace" className="text-primary hover:underline text-sm">Go to workspaces</Link>
        </div>
      </div>
    );
  }

  if (invitation.expiresAt < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold">Invitation expired</h1>
          <p className="text-muted-foreground">This invitation expired on {invitation.expiresAt.toLocaleDateString()}.</p>
          <p className="text-sm text-muted-foreground">Ask the workspace owner to send a new invitation.</p>
        </div>
      </div>
    );
  }

  if (invitation.accepted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold">Already accepted</h1>
          <p className="text-muted-foreground">This invitation has already been used.</p>
          <Link href="/workspace" className="text-primary hover:underline text-sm">Go to workspaces</Link>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  let session = null;
  try {
    session = await requireAuth();
  } catch {
    // Not authenticated — redirect to register with token
    redirect(`/register?invite=${token}`);
  }

  return (
    <AcceptInviteClient
      token={token}
      workspaceName={invitation.workspace.name}
      workspaceId={invitation.workspace.id}
      inviterName={invitation.sentBy?.name ?? "Someone"}
      invitedEmail={invitation.email}
      currentUserEmail={session?.email ?? ""}  
    />
  );
}
