"use server";

import bcrypt from "bcrypt";
import crypto from "crypto";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import {
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendPasswordResetEmail,
} from "@/lib/email/mailer";

// ─── Register ──────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name:     z.string().min(2).max(80),
  email:    z.string().email(),
  password: z.string().min(8).max(64),
});

export async function registerAction(_prev: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse({
    name:     formData.get("name"),
    email:    formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const e = parsed.error.flatten().fieldErrors;
    return { success: false, error: e.name?.[0] ?? e.email?.[0] ?? e.password?.[0] ?? "Invalid input" };
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return { success: false, error: "An account with this email already exists" };

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, passwordHash, emailVerified: false },
    select: { id: true },
  });

  // Accept any pending invitations
  const pending = await prisma.invitation.findMany({
    where: { email: normalizedEmail, accepted: false, expiresAt: { gt: new Date() } },
    select: { id: true, workspaceId: true, role: true },
  });
  for (const inv of pending) {
    await prisma.workspaceMember.upsert({
      where: { userId_workspaceId: { userId: user.id, workspaceId: inv.workspaceId } },
      create: { userId: user.id, workspaceId: inv.workspaceId, role: inv.role },
      update: { role: inv.role },
    });
    await prisma.invitation.update({ where: { id: inv.id }, data: { accepted: true } });
  }

  // Welcome email (non-blocking)
  sendWelcomeEmail({ to: normalizedEmail, name }).catch(() => {});

  return { success: true, error: "" };
}

// ─── Login ─────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email:     z.string().email(),
  password:  z.string().min(1),
  userAgent: z.string().optional(),
});

export async function loginAction(_prev: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email:     formData.get("email"),
    password:  formData.get("password"),
    userAgent: formData.get("userAgent"),
  });
  if (!parsed.success) return { success: false, error: "Invalid email or password format" };

  const { email, password, userAgent } = parsed.data;

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    return { success: false, error: "Invalid email or password" };
  }

  // Fetch user for notification email
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() }, select: { id: true, name: true, email: true } });
  if (user) {
    // Create in-app login notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "LOGIN",
        title: "New sign-in to your account",
        message: `A sign-in was recorded for ${user.email}`,
      },
    });
    // Login email (non-blocking)
    sendLoginNotificationEmail({
      to: user.email,
      name: user.name,
      loginAt: new Date(),
      userAgent,
    }).catch(() => {});
  }

  return { success: true, error: "" };
}

// ─── Forgot Password ───────────────────────────────────────────────────────────
const forgotSchema = z.object({ email: z.string().email() });

export async function forgotPasswordAction(_prev: unknown, formData: FormData) {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { success: false, error: "Enter a valid email address" };

  const email = parsed.data.email.toLowerCase().trim();

  // Always return success (don't reveal whether email exists)
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true } });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });
    sendPasswordResetEmail({ to: user.email, name: user.name, resetToken: token }).catch(() => {});
  }

  return { success: true, error: "" };
}

// ─── Reset Password ────────────────────────────────────────────────────────────
const resetSchema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8).max(64),
});

export async function resetPasswordAction(_prev: unknown, formData: FormData) {
  const parsed = resetSchema.safeParse({
    token:    formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const e = parsed.error.flatten().fieldErrors;
    return { success: false, error: e.token?.[0] ?? e.password?.[0] ?? "Invalid input" };
  }

  const { token, password } = parsed.data;

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    select: { id: true, userId: true, expiresAt: true, used: true },
  });

  if (!record || record.used) return { success: false, error: "This reset link is invalid" };
  if (record.expiresAt < new Date()) return { success: false, error: "This reset link has expired" };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: record.userId }, data: { passwordHash } });
  await prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } });

  return { success: true, error: "" };
}

// ─── Change Password (authenticated) ──────────────────────────────────────────
const changeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8).max(64),
});

export async function changePasswordAction(_prev: unknown, formData: FormData) {
  const { getCurrentUser } = await import("@/lib/auth/session");
  const session = await getCurrentUser();
  if (!session) return { success: false, error: "Not authenticated" };

  const parsed = changeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword:     formData.get("newPassword"),
  });
  if (!parsed.success) {
    const e = parsed.error.flatten().fieldErrors;
    return { success: false, error: e.currentPassword?.[0] ?? e.newPassword?.[0] ?? "Invalid input" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { id: true, passwordHash: true } });
  if (!user) return { success: false, error: "User not found" };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { success: false, error: "Current password is incorrect" };

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

  return { success: true, error: "" };
}
