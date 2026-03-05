"use server";

import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin/auth";
import { redirect } from "next/navigation";

async function guard() {
  const ok = await getAdminSession();
  if (!ok) redirect("/admin/login");
}

export async function getAdminStats() {
  await guard();
  const [users, workspaces, boards, cards, invitations] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.board.count(),
    prisma.card.count(),
    prisma.invitation.count({ where: { accepted: false, expiresAt: { gt: new Date() } } }),
  ]);
  return { users, workspaces, boards, cards, pendingInvitations: invitations };
}

export async function getAdminUsers(page = 1, limit = 20) {
  await guard();
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip, take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, emailVerified: true, createdAt: true,
        _count: { select: { workspaceMembers: true, createdBoards: true } },
      },
    }),
    prisma.user.count(),
  ]);
  return { users, total, pages: Math.ceil(total / limit) };
}

export async function getAdminWorkspaces(page = 1, limit = 20) {
  await guard();
  const skip = (page - 1) * limit;
  const [workspaces, total] = await Promise.all([
    prisma.workspace.findMany({
      skip, take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, description: true, createdAt: true,
        owner: { select: { name: true, email: true } },
        _count: { select: { members: true, boards: true } },
      },
    }),
    prisma.workspace.count(),
  ]);
  return { workspaces, total, pages: Math.ceil(total / limit) };
}

export async function adminDeleteUser(userId: string) {
  await guard();
  await prisma.user.delete({ where: { id: userId } });
  return { success: true };
}

export async function adminDeleteWorkspace(workspaceId: string) {
  await guard();
  await prisma.workspace.delete({ where: { id: workspaceId } });
  return { success: true };
}
