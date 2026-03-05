"use server";

import bcrypt from "bcrypt";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { redirect } from "next/navigation";

// ─── Register ──────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(64),
});

export async function registerAction(_prevState: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const err = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      error: err.name?.[0] ?? err.email?.[0] ?? err.password?.[0] ?? "Invalid input",
    };
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return { success: false, error: "An account with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      emailVerified: false, // set true after email verification (future feature)
    },
    select: { id: true },
  });

  // Check for pending invitations matching this email
  const pendingInvites = await prisma.invitation.findMany({
    where: { email: normalizedEmail, accepted: false, expiresAt: { gt: new Date() } },
    select: { id: true, workspaceId: true, role: true },
  });

  for (const invite of pendingInvites) {
    await prisma.workspaceMember.upsert({
      where: { userId_workspaceId: { userId: user.id, workspaceId: invite.workspaceId } },
      create: { userId: user.id, workspaceId: invite.workspaceId, role: invite.role },
      update: { role: invite.role },
    });
    await prisma.invitation.update({ where: { id: invite.id }, data: { accepted: true } });
  }

  return { success: true, error: "" };
}

// ─── Change Password (stub) ────────────────────────────────────────────────────
export async function changePasswordAction(_prevState: unknown, _formData: FormData) {
  return { success: false, error: "Feature coming soon" };
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginAction(_prevState: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid email or password format" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true, error: "" };
  } catch {
    return { success: false, error: "Invalid email or password" };
  }
}

