"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { requireWorkspaceMember } from "@/lib/rbac";
import { sendInvitationEmail } from "@/lib/email/mailer";
import type { WorkspaceRole } from "@/types/domain";
import { emitNotification } from "@/lib/socket";

// ─── Invite Member (email-based) ────────────────────────────────────────────────
const inviteSchema = z.object({
  workspaceId: z.string().cuid(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export async function inviteMemberAction(input: z.infer<typeof inviteSchema>) {
  const parsed = inviteSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  const { user } = await requireWorkspaceMember(parsed.data.workspaceId, ["OWNER", "ADMIN"]);

  const normalizedEmail = parsed.data.email.toLowerCase().trim();

  // Check if user already a member
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, name: true },
  });

  const workspace = await prisma.workspace.findUnique({
    where: { id: parsed.data.workspaceId },
    select: { name: true },
  });

  if (!workspace) return { success: false, error: "Workspace not found" };

  if (existingUser) {
    const alreadyMember = await prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId: existingUser.id, workspaceId: parsed.data.workspaceId } },
    });

    if (alreadyMember) {
      return { success: false, error: "User is already a workspace member" };
    }

    // Add directly
    await prisma.workspaceMember.create({
      data: {
        userId: existingUser.id,
        workspaceId: parsed.data.workspaceId,
        role: parsed.data.role as WorkspaceRole,
      },
    });

    // Notification
    const notification = await prisma.notification.create({
      data: {
        userId: existingUser.id,
        workspaceId: parsed.data.workspaceId,
        type: "WORKSPACE_INVITE",
        title: "You were added to a workspace",
        message: `${user.name} added you to workspace "${workspace.name}"`,
        link: `/workspace/${parsed.data.workspaceId}`,
      },
    });

    await emitNotification(existingUser.id, {
      id: notification.id,
      userId: existingUser.id,
      workspaceId: parsed.data.workspaceId,
      type: "WORKSPACE_INVITE",
      title: notification.title,
      message: notification.message,
      isRead: false,
      link: notification.link,
      createdAt: notification.createdAt.toISOString(),
    });
  } else {
    // Create invitation record
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Delete old invitations for same workspace+email
    await prisma.invitation.deleteMany({
      where: { workspaceId: parsed.data.workspaceId, email: normalizedEmail },
    });

    await prisma.invitation.create({
      data: {
        workspaceId: parsed.data.workspaceId,
        email: normalizedEmail,
        role: parsed.data.role as WorkspaceRole,
        token,
        expiresAt,
        sentById: user.id,
      },
    });

    // Send email
    await sendInvitationEmail({
      to: normalizedEmail,
      inviterName: user.name ?? "A team member",
      workspaceName: workspace.name,
      inviteToken: token,
    });
  }

  const added = !!existingUser;
  revalidatePath(`/workspace/${parsed.data.workspaceId}/members`);
  return { success: true, error: "", data: { added } };
}

// ─── Accept Invitation by Token ─────────────────────────────────────────────────
export async function acceptInvitationAction(token: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { workspace: { select: { id: true, name: true } } },
  });

  if (!invitation) return { success: false, error: "Invitation not found" };
  if (invitation.accepted) return { success: false, error: "Invitation already accepted", data: null };
  if (invitation.expiresAt < new Date()) return { success: false, error: "Invitation has expired" };

  const existingUser = await prisma.user.findUnique({
    where: { email: invitation.email },
    select: { id: true },
  });

  if (!existingUser) {
    // User not registered — redirect to register with token
    return { success: false, error: "REGISTER_FIRST", token, email: invitation.email };
  }

  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: existingUser.id, workspaceId: invitation.workspaceId } },
    create: { userId: existingUser.id, workspaceId: invitation.workspaceId, role: invitation.role },
    update: { role: invitation.role },
  });

  await prisma.invitation.update({ where: { id: invitation.id }, data: { accepted: true } });

  return { success: true, data: { workspaceId: invitation.workspaceId }, error: "" };
}
