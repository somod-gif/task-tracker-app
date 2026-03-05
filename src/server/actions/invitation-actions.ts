"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/rbac";
import { sendInvitationEmail, sendWorkspaceInviteEmail } from "@/lib/email/mailer";
import type { WorkspaceRole } from "@/types/domain";
import { emitNotification } from "@/lib/socket";

const inviteSchema = z.object({
  workspaceId: z.string().cuid(),
  email:       z.string().email(),
  role:        z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export async function inviteMemberAction(input: z.infer<typeof inviteSchema>) {
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const { user } = await requireWorkspaceMember(parsed.data.workspaceId, ["OWNER", "ADMIN"]);
  const email = parsed.data.email.toLowerCase().trim();

  const workspace = await prisma.workspace.findUnique({
    where: { id: parsed.data.workspaceId },
    select: { name: true },
  });
  if (!workspace) return { success: false, error: "Workspace not found" };

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });

  if (existingUser) {
    const alreadyMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: existingUser.id, workspaceId: parsed.data.workspaceId } },
    });
    if (alreadyMember) return { success: false, error: "User is already a workspace member" };

    await prisma.workspaceMember.create({
      data: { userId: existingUser.id, workspaceId: parsed.data.workspaceId, role: parsed.data.role as WorkspaceRole },
    });

    const inviterName = user.name ?? "A team member";

    const notif = await prisma.notification.create({
      data: {
        userId: existingUser.id,
        workspaceId: parsed.data.workspaceId,
        type: "WORKSPACE_INVITE",
        title: "You were added to a workspace",
        message: `${user.name} added you to "${workspace.name}"`,
        link: `/workspace/${parsed.data.workspaceId}`,
      },
    });
    await emitNotification(existingUser.id, {
      id: notif.id, userId: existingUser.id, workspaceId: parsed.data.workspaceId,
      type: "WORKSPACE_INVITE", title: notif.title, message: notif.message,
      isRead: false, link: notif.link, createdAt: notif.createdAt.toISOString(),
    });

    // Email existing user
    sendWorkspaceInviteEmail({
      to: existingUser.email, inviterName,
      workspaceName: workspace.name, workspaceId: parsed.data.workspaceId,
    }).catch(() => {});
  } else {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.invitation.deleteMany({
      where: { workspaceId: parsed.data.workspaceId, email },
    });
    await prisma.invitation.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        email,
        role: parsed.data.role as WorkspaceRole,
        token,
        expiresAt,
        sentById: user.id,
      },
    });

    sendInvitationEmail({ to: email, inviterName: user.name ?? "A team member", workspaceName: workspace.name, inviteToken: token }).catch(() => {});
  }

  revalidatePath(`/workspace/${parsed.data.workspaceId}/members`);
  return { success: true, error: "", added: Boolean(existingUser) };
}

export async function acceptInvitationAction(token: string) {
  const { getCurrentUser } = await import("@/lib/auth/session");
  const session = await getCurrentUser();
  if (!session) return { success: false, error: "You must be logged in to accept an invitation" };

  const invite = await prisma.invitation.findUnique({
    where: { token },
    select: { id: true, workspaceId: true, role: true, email: true, expiresAt: true, accepted: true },
  });

  if (!invite) return { success: false, error: "Invitation not found" };
  if (invite.accepted) return { success: false, error: "Invitation already accepted" };
  if (invite.expiresAt < new Date()) return { success: false, error: "Invitation has expired" };

  const existing = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: session.id, workspaceId: invite.workspaceId } },
  });
  if (existing) return { success: false, error: "You are already a member of this workspace" };

  await prisma.workspaceMember.create({
    data: { userId: session.id, workspaceId: invite.workspaceId, role: invite.role as WorkspaceRole },
  });
  await prisma.invitation.update({ where: { id: invite.id }, data: { accepted: true } });

  return { success: true, workspaceId: invite.workspaceId };
}
