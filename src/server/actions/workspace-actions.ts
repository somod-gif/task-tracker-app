"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { requireWorkspaceMember } from "@/lib/rbac";
import { sendWorkspaceCreatedEmail } from "@/lib/email/mailer";
import type { WorkspaceRole } from "@/types/domain";

// ─── Create Workspace ──────────────────────────────────────────────────────────
const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(300).optional(),
});

export async function createWorkspaceAction(input: { name: string; description?: string }) {
  const user = await requireAuth();

  const parsed = createWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors.name?.[0] ?? "Invalid input", data: null };
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      ownerId: user.id,
    },
    select: { id: true },
  });

  await prisma.workspaceMember.create({
    data: { userId: user.id, workspaceId: workspace.id, role: "OWNER" },
  });

  if (user.email) {
    sendWorkspaceCreatedEmail({
      to: user.email,
      name: user.name ?? "there",
      workspaceName: parsed.data.name,
      workspaceId: workspace.id,
    }).catch(() => {});
  }

  revalidatePath("/workspace");
  return { success: true, error: "", data: workspace };
}

// ─── Update Workspace ──────────────────────────────────────────────────────────
const updateWorkspaceSchema = z.object({
  workspaceId: z.string().cuid(),
  name: z.string().min(2).max(80),
  description: z.string().max(300).optional(),
});

export async function updateWorkspaceAction(input: { workspaceId: string; name: string; description?: string }) {
  const parsed = updateWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input", data: null };
  }

  await requireWorkspaceMember(parsed.data.workspaceId, ["OWNER", "ADMIN"]);

  await prisma.workspace.update({
    where: { id: parsed.data.workspaceId },
    data: { name: parsed.data.name, description: parsed.data.description },
  });

  revalidatePath(`/workspace/${parsed.data.workspaceId}`);
  return { success: true, error: "", data: null };
}

// ─── Delete Workspace ──────────────────────────────────────────────────────────
export async function deleteWorkspaceAction(workspaceId: string) {
  await requireWorkspaceMember(workspaceId, ["OWNER"]);

  await prisma.workspace.delete({ where: { id: workspaceId } });

  revalidatePath("/workspace");
  return { success: true };
}

// ─── Remove Member ─────────────────────────────────────────────────────────────
export async function removeMemberAction(input: { workspaceId: string; memberId: string }) {
  const { workspaceId, memberId: targetUserId } = input;
  const { user, role } = await requireWorkspaceMember(workspaceId, ["OWNER", "ADMIN"]);

  // Admins cannot remove owners
  const targetMembership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    select: { role: true },
  });

  if (!targetMembership) return { success: false, error: "Member not found" };
  if (targetMembership.role === "OWNER") return { success: false, error: "Cannot remove workspace owner" };
  if (role === "ADMIN" && targetMembership.role === "ADMIN" && targetUserId !== user.id) {
    return { success: false, error: "Admins cannot remove other admins" };
  }

  await prisma.workspaceMember.delete({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
  });

  revalidatePath(`/workspace/${workspaceId}/members`);
  return { success: true, error: "", data: null };
}

// ─── Update Member Role ────────────────────────────────────────────────────────
export async function updateMemberRoleAction(input: {
  workspaceId: string;
  memberId: string;
  role: WorkspaceRole;
}) {
  const { workspaceId, memberId: targetUserId, role: newRole } = input;
  await requireWorkspaceMember(workspaceId, ["OWNER"]);

  await prisma.workspaceMember.update({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    data: { role: newRole },
  });

  revalidatePath(`/workspace/${workspaceId}/members`);
  return { success: true, error: "", data: null };
}

// ─── Get User Workspaces ────────────────────────────────────────────────────────
export async function getUserWorkspacesAction() {
  const user = await requireAuth();

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: user.id },
    include: {
      workspace: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  const data = memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    logo: m.workspace.logo,
    description: m.workspace.description,
    ownerId: m.workspace.ownerId,
    role: m.role as WorkspaceRole,
    memberCount: m.workspace._count.members,
    createdAt: m.workspace.createdAt,
  }));

  return { success: true, data, error: "" };
}
