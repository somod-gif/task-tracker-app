/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Writes all generated source files for the Sprint Desk refactor.
 * Run: node scripts/write-files.cjs
 */
const fs = require("fs");
const path = require("path");

function w(rel, content) {
  const abs = path.join(__dirname, "..", rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.trimStart(), "utf8");
  console.log("✓", rel);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. EMAIL SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════
w("src/lib/email/mailer.ts", `
/**
 * Sprint Desk — Email System
 * All transactional emails sent via Nodemailer (SMTP).
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const P = "#262166"; // brand primary
const A = "#1593c6"; // brand accent

type Mail = { to: string; subject: string; html: string };

async function send(mail: Mail): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    console.warn("[mailer] SMTP not configured — skipping:", mail.subject);
    return;
  }
  try {
    const nodemailer = (await import("nodemailer")) as typeof import("nodemailer");
    const t = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
    await t.sendMail({
      from: process.env.SMTP_FROM ?? \`Sprint Desk <\${user}>\`,
      to: mail.to, subject: mail.subject, html: mail.html,
    });
  } catch (e) { console.error("[mailer] send error:", e); }
}

function wrap(body: string) {
  return \`<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
<tr><td style="background:\${P};padding:20px 32px;"><span style="font-size:22px;font-weight:700;color:#fff;">&#9889; Sprint Desk</span></td></tr>
<tr><td style="padding:32px;">\${body}</td></tr>
<tr><td style="background:#f7f9fc;padding:14px 32px;border-top:1px solid #edf0f5;">
<p style="margin:0;font-size:11px;color:#9aa5b4;">This email was sent by Sprint Desk. If you did not expect it, you can safely ignore it. &copy; \${new Date().getFullYear()} Sprint Desk.</p>
</td></tr></table></td></tr></table></body></html>\`;
}

const cta = (label: string, href: string) =>
  \`<a href="\${href}" style="display:inline-block;background:\${A};color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;margin-top:20px;">\${label} &rarr;</a>\`;

const hr = () => \`<hr style="border:none;border-top:1px solid #edf0f5;margin:24px 0;">\`;

const row = (k: string, v: string) =>
  \`<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:140px;">\${k}</td><td style="padding:4px 0;font-size:13px;color:#111827;font-weight:500;">\${v}</td></tr>\`;

const tbl = (rows: string) =>
  \`<table cellpadding="0" cellspacing="0" style="background:#f7f9fc;border:1px solid #edf0f5;border-radius:8px;padding:16px;width:100%;"><tbody>\${rows}</tbody></table>\`;

const warn = (msg: string) =>
  \`<div style="background:#fff8e1;border:1px solid #fbbf24;border-radius:8px;padding:14px;margin-top:20px;"><p style="margin:0;font-size:13px;color:#92400e;">\${msg}</p></div>\`;

const h2 = (t: string) => \`<h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:\${P};">\${t}</h2>\`;
const p  = (t: string) => \`<p style="margin:0 0 16px;font-size:14px;color:#4a5568;line-height:1.7;">\${t}</p>\`;

export async function sendWelcomeEmail({ to, name }: { to: string; name: string }) {
  await send({
    to, subject: "Welcome to Sprint Desk",
    html: wrap(
      h2(\`Welcome, \${name}!\`) +
      p("Your Sprint Desk account is ready. Build Kanban boards, invite your team, and ship projects faster.") +
      \`<ol style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#4a5568;line-height:2.2;">
        <li>Create your first <strong>workspace</strong></li>
        <li>Invite teammates by email</li>
        <li>Build a <strong>board</strong> and add cards</li>
        <li>Drag cards from <em>To Do</em> to <em>Done</em></li>
      </ol>\` +
      cta("Open Sprint Desk", \`\${APP_URL}/workspace\`) +
      hr() +
      \`<p style="margin:0;font-size:12px;color:#9aa5b4;">Account email: <strong>\${to}</strong></p>\`
    ),
  });
}

export async function sendLoginNotificationEmail({
  to, name, loginAt, userAgent,
}: { to: string; name: string; loginAt: Date; userAgent?: string }) {
  const time = loginAt.toLocaleString("en-US", {
    weekday: "long", year: "numeric", month: "long",
    day: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });
  await send({
    to, subject: "New Sign-in to Your Sprint Desk Account",
    html: wrap(
      h2("New Sign-in Detected") +
      p(\`Hi <strong>\${name}</strong>, a sign-in to your Sprint Desk account was just recorded.\`) +
      tbl(row("Account", to) + row("Time", time) + row("Device", userAgent ? userAgent.slice(0, 80) : "Unknown")) +
      warn("<strong>Wasn&apos;t you?</strong> Change your password immediately.") +
      cta("Change My Password", \`\${APP_URL}/forgot-password\`)
    ),
  });
}

export async function sendPasswordResetEmail({
  to, name, resetToken,
}: { to: string; name: string; resetToken: string }) {
  const link = \`\${APP_URL}/reset-password?token=\${resetToken}\`;
  await send({
    to, subject: "Reset Your Sprint Desk Password",
    html: wrap(
      h2("Reset Your Password") +
      p(\`Hi <strong>\${name}</strong>, we received a request to reset your password. This link expires in <strong>1 hour</strong>.\`) +
      cta("Reset Password", link) +
      hr() +
      \`<p style="font-size:12px;color:#9aa5b4;margin:0;">
        Didn&apos;t request this? Ignore this email.<br><br>
        Link: <a href="\${link}" style="color:\${A};">\${link}</a>
      </p>\`
    ),
  });
}

export async function sendWorkspaceInviteEmail({
  to, inviterName, workspaceName, workspaceId,
}: { to: string; inviterName: string; workspaceName: string; workspaceId: string }) {
  await send({
    to, subject: \`You were added to "\${workspaceName}" on Sprint Desk\`,
    html: wrap(
      h2("You have been added to a workspace") +
      p(\`<strong>\${inviterName}</strong> added you to <strong>"\${workspaceName}"</strong> on Sprint Desk.\`) +
      cta(\`Open "\${workspaceName}"\`, \`\${APP_URL}/workspace/\${workspaceId}\`)
    ),
  });
}

export async function sendInvitationEmail({
  to, inviterName, workspaceName, inviteToken,
}: { to: string; inviterName: string; workspaceName: string; inviteToken: string }) {
  const link = \`\${APP_URL}/invite/\${inviteToken}\`;
  await send({
    to, subject: \`\${inviterName} invited you to "\${workspaceName}" on Sprint Desk\`,
    html: wrap(
      h2("You have been invited to Sprint Desk") +
      p(\`<strong>\${inviterName}</strong> invited you to join <strong>"\${workspaceName}"</strong>. This link expires in <strong>7 days</strong>.\`) +
      cta("Accept Invitation", link) +
      hr() +
      \`<p style="font-size:12px;color:#9aa5b4;margin:0;">Link: <a href="\${link}" style="color:\${A};">\${link}</a></p>\`
    ),
  });
}

export async function sendCardAssignedEmail({
  to, name, assignerName, cardTitle, boardTitle, cardLink,
}: { to: string; name: string; assignerName: string; cardTitle: string; boardTitle: string; cardLink: string }) {
  await send({
    to, subject: \`You were assigned: "\${cardTitle}"\`,
    html: wrap(
      h2("Task Assigned to You") +
      p(\`Hi <strong>\${name}</strong>, <strong>\${assignerName}</strong> assigned you to a task.\`) +
      tbl(row("Task", cardTitle) + row("Board", boardTitle) + row("By", assignerName)) +
      cta("View Task", cardLink)
    ),
  });
}

/** Legacy shim — preserves existing callers */
export async function sendEmailToUser({
  userId, type: _type, title, message,
}: { userId: string; type: string; title: string; message: string }) {
  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!user?.email) return;
  await send({
    to: user.email,
    subject: \`[Sprint Desk] \${title}\`,
    html: wrap(h2(title) + p(message) + cta("Open Sprint Desk", \`\${APP_URL}/workspace\`)),
  });
}
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. AUTH ACTIONS (with email hooks)
// ═══════════════════════════════════════════════════════════════════════════════
w("src/server/actions/auth-actions.ts", `
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
        message: \`A sign-in was recorded for \${user.email}\`,
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
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. INVITATION ACTIONS  (adds email for existing users)
// ═══════════════════════════════════════════════════════════════════════════════
w("src/server/actions/invitation-actions.ts", `
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

    const notif = await prisma.notification.create({
      data: {
        userId: existingUser.id,
        workspaceId: parsed.data.workspaceId,
        type: "WORKSPACE_INVITE",
        title: "You were added to a workspace",
        message: \`\${user.name} added you to "\${workspace.name}"\`,
        link: \`/workspace/\${parsed.data.workspaceId}\`,
      },
    });
    await emitNotification(existingUser.id, {
      id: notif.id, userId: existingUser.id, workspaceId: parsed.data.workspaceId,
      type: "WORKSPACE_INVITE", title: notif.title, message: notif.message,
      isRead: false, link: notif.link, createdAt: notif.createdAt.toISOString(),
    });

    // Email existing user
    sendWorkspaceInviteEmail({
      to: existingUser.email, inviterName: user.name,
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

    sendInvitationEmail({ to: email, inviterName: user.name, workspaceName: workspace.name, inviteToken: token }).catch(() => {});
  }

  revalidatePath(\`/workspace/\${parsed.data.workspaceId}/members\`);
  return { success: true, error: "" };
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
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 4. FORGOT PASSWORD PAGE
// ═══════════════════════════════════════════════════════════════════════════════
w("src/app/forgot-password/page.tsx", `
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/auth/session";
import { PublicShell } from "@/components/marketing/public-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Forgot Password" };

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) redirect("/workspace");

  return (
    <PublicShell activePath="">
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <ForgotPasswordForm />
      </main>
    </PublicShell>
  );
}
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. RESET PASSWORD PAGE
// ═══════════════════════════════════════════════════════════════════════════════
w("src/app/reset-password/page.tsx", `
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/auth/session";
import { PublicShell } from "@/components/marketing/public-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Reset Password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/workspace");

  const { token } = await searchParams;
  if (!token) redirect("/forgot-password");

  return (
    <PublicShell activePath="">
      <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <ResetPasswordForm token={token} />
      </main>
    </PublicShell>
  );
}
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 6. FORGOT PASSWORD FORM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
w("src/components/auth/forgot-password-form.tsx", `
"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appToast } from "@/lib/toast";
import { forgotPasswordAction } from "@/server/actions/auth-actions";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, { success: false, error: "" });

  useEffect(() => {
    if (state.error) appToast.error(state.error);
  }, [state]);

  if (state.success) {
    return (
      <Card className="w-full max-w-md border border-border/60 shadow-xl">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Mail className="size-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Check your inbox</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If that email address is registered, you will receive a password reset link within a few minutes.
            The link expires in 1 hour.
          </p>
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium">
            <ArrowLeft className="size-3.5" /> Back to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border border-border/60 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-center">Forgot your password?</CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          Enter your email and we will send you a reset link.
        </p>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required autoFocus />
          </div>
          <Button className="w-full h-11 font-semibold" type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send reset link"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline font-medium">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. RESET PASSWORD FORM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
w("src/components/auth/reset-password-form.tsx", `
"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { appToast } from "@/lib/toast";
import { resetPasswordAction } from "@/server/actions/auth-actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(resetPasswordAction, { success: false, error: "" });

  useEffect(() => {
    if (state.error) appToast.error(state.error);
    if (state.success) {
      appToast.success("Password updated! Please sign in.");
      setTimeout(() => router.push("/login"), 2000);
    }
  }, [state, router]);

  if (state.success) {
    return (
      <Card className="w-full max-w-md border border-border/60 shadow-xl">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="size-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold">Password updated!</h2>
          <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border border-border/60 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-center">Set a new password</CardTitle>
        <p className="text-center text-sm text-muted-foreground">Choose a strong password for your account.</p>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <PasswordInput id="password" name="password" minLength={8} required autoFocus />
            <p className="text-xs text-muted-foreground">At least 8 characters</p>
          </div>
          <Button className="w-full h-11 font-semibold" type="submit" disabled={pending}>
            {pending ? "Updating…" : "Update password"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline font-medium">Back to sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 8. UPDATED LOGIN FORM  (adds forgot password link + passes userAgent)
// ═══════════════════════════════════════════════════════════════════════════════
w("src/components/auth/login-form.tsx", `
"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { appToast } from "@/lib/toast";

export function LoginForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleLogin(_prev: unknown, formData: FormData) {
    const email    = String(formData.get("email")    ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) return { success: false, error: "Invalid email or password" };
    return { success: true, error: "" };
  }

  const [state, formAction, pending] = useActionState(handleLogin, { success: false, error: "" });

  useEffect(() => {
    if (state.success) {
      appToast.success("Signed in successfully!");
      router.push("/workspace");
      router.refresh();
    } else if (state.error) {
      appToast.error(state.error);
    }
  }, [state, router]);

  return (
    <Card className="w-full max-w-md border border-border/60 bg-card shadow-xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-center text-3xl font-bold tracking-tight">Welcome back</CardTitle>
        <p className="text-center text-sm text-muted-foreground">Sign in to your Sprint Desk account</p>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="userAgent" value={typeof navigator !== "undefined" ? navigator.userAgent : ""} />
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required autoFocus />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <PasswordInput id="password" name="password" required />
          </div>
          <Button className="h-11 w-full font-semibold text-base" type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">Create one</Link>
        </p>
      </CardContent>
    </Card>
  );
}
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 9. REGISTER FORM (clean version)
// ═══════════════════════════════════════════════════════════════════════════════
w("src/components/auth/register-form.tsx", `
"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { appToast } from "@/lib/toast";
import { registerAction } from "@/server/actions/auth-actions";

export function RegisterForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(registerAction, { success: false, error: "" });

  useEffect(() => {
    if (state.error) appToast.error(state.error);
    if (state.success) {
      appToast.success("Account created! Signing you in…");
      router.push("/login");
    }
  }, [state, router]);

  return (
    <Card className="w-full max-w-md border border-border/60 shadow-xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-center text-3xl font-bold tracking-tight">Create your account</CardTitle>
        <p className="text-center text-sm text-muted-foreground">Free forever. No credit card required.</p>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" placeholder="Sarah Johnson" required autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" name="password" minLength={8} required />
            <p className="text-xs text-muted-foreground">At least 8 characters</p>
          </div>
          <Button className="h-11 w-full font-semibold text-base" type="submit" disabled={pending}>
            {pending ? "Creating account…" : "Create free account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 10. ADMIN — middleware helper
// ═══════════════════════════════════════════════════════════════════════════════
w("src/lib/admin/auth.ts", `
import { cookies } from "next/headers";

const ADMIN_COOKIE = "sd_admin_session";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

export function adminEnabled(): boolean {
  return Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);
}

export async function getAdminSession(): Promise<boolean> {
  if (!adminEnabled()) return false;
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === "authenticated";
}

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export { ADMIN_COOKIE };
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 11. ADMIN — server actions
// ═══════════════════════════════════════════════════════════════════════════════
w("src/server/actions/admin-auth-actions.ts", `
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { verifyAdminCredentials, ADMIN_COOKIE } from "@/lib/admin/auth";

export async function adminLoginAction(_prev: unknown, formData: FormData) {
  const email    = String(formData.get("email")    ?? "");
  const password = String(formData.get("password") ?? "");

  const ok = await verifyAdminCredentials(email, password);
  if (!ok) return { success: false, error: "Invalid admin credentials" };

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });

  return { success: true, error: "" };
}

export async function adminLogoutAction() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
export { schema as adminLoginSchema };
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 12. ADMIN — data actions
// ═══════════════════════════════════════════════════════════════════════════════
w("src/server/actions/admin-data-actions.ts", `
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
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 13. ADMIN — login page
// ═══════════════════════════════════════════════════════════════════════════════
w("src/app/admin/login/page.tsx", `
import { redirect } from "next/navigation";
import { getAdminSession, adminEnabled } from "@/lib/admin/auth";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default async function AdminLoginPage() {
  if (!adminEnabled()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Admin Disabled</h1>
          <p className="text-slate-400 text-sm">Set ADMIN_EMAIL and ADMIN_PASSWORD in env to enable.</p>
        </div>
      </main>
    );
  }

  const ok = await getAdminSession();
  if (ok) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Sprint Desk</h1>
          <p className="mt-1 text-sm text-slate-400">Admin Dashboard</p>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  );
}
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 14. ADMIN — dashboard layout
// ═══════════════════════════════════════════════════════════════════════════════
w("src/app/admin/layout.tsx", `
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/admin/auth";
import { adminLogoutAction } from "@/server/actions/admin-auth-actions";
import {
  LayoutDashboard, Users, Layers, LogOut,
} from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ok = await getAdminSession();
  if (!ok) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col">
        <div className="p-5 border-b border-slate-800">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Sprint Desk</p>
          <p className="text-white font-semibold text-sm mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { href: "/admin",            icon: LayoutDashboard, label: "Overview" },
            { href: "/admin/users",      icon: Users,           label: "Users" },
            { href: "/admin/workspaces", icon: Layers,          label: "Workspaces" },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 15. ADMIN — overview page
// ═══════════════════════════════════════════════════════════════════════════════
w("src/app/admin/page.tsx", `
import { Users, Layers, LayoutList, CheckSquare, Mail } from "lucide-react";
import { getAdminStats } from "@/server/actions/admin-data-actions";

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Total Users",       value: stats.users,              icon: Users,       color: "text-blue-400" },
    { label: "Workspaces",        value: stats.workspaces,         icon: Layers,      color: "text-purple-400" },
    { label: "Boards",            value: stats.boards,             icon: LayoutList,  color: "text-emerald-400" },
    { label: "Cards",             value: stats.cards,              icon: CheckSquare, color: "text-amber-400" },
    { label: "Pending Invites",   value: stats.pendingInvitations, icon: Mail,        color: "text-rose-400" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</span>
              <Icon className={\`size-4 \${color}\`} />
            </div>
            <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 16. ADMIN — users page
// ═══════════════════════════════════════════════════════════════════════════════
w("src/app/admin/users/page.tsx", `
import { getAdminUsers } from "@/server/actions/admin-data-actions";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const { users, total, pages } = await getAdminUsers(page);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Users</h1>
      <p className="text-slate-400 text-sm mb-6">{total.toLocaleString()} total</p>

      <div className="rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-center font-semibold">Workspaces</th>
              <th className="px-4 py-3 text-center font-semibold">Boards</th>
              <th className="px-4 py-3 text-center font-semibold">Joined</th>
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40 text-slate-300">
                <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                <td className="px-4 py-3 text-slate-400">{u.email}</td>
                <td className="px-4 py-3 text-center">{u._count.workspaceMembers}</td>
                <td className="px-4 py-3 text-center">{u._count.createdBoards}</td>
                <td className="px-4 py-3 text-center text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-center">
                  <AdminDeleteButton type="user" id={u.id} label={u.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex gap-2 justify-end">
          {Array.from({ length: pages }, (_, i) => (
            <a
              key={i}
              href={\`?page=\${i + 1}\`}
              className={\`px-3 py-1 rounded text-xs font-medium \${
                page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }\`}
            >
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 17. ADMIN — workspaces page
// ═══════════════════════════════════════════════════════════════════════════════
w("src/app/admin/workspaces/page.tsx", `
import { getAdminWorkspaces } from "@/server/actions/admin-data-actions";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";

export default async function AdminWorkspacesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const { workspaces, total, pages } = await getAdminWorkspaces(page);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Workspaces</h1>
      <p className="text-slate-400 text-sm mb-6">{total.toLocaleString()} total</p>

      <div className="rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Owner</th>
              <th className="px-4 py-3 text-center font-semibold">Members</th>
              <th className="px-4 py-3 text-center font-semibold">Boards</th>
              <th className="px-4 py-3 text-center font-semibold">Created</th>
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {workspaces.map((ws) => (
              <tr key={ws.id} className="hover:bg-slate-800/40 text-slate-300">
                <td className="px-4 py-3 font-medium text-white">{ws.name}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{ws.owner.name} <br/><span className="text-slate-500">{ws.owner.email}</span></td>
                <td className="px-4 py-3 text-center">{ws._count.members}</td>
                <td className="px-4 py-3 text-center">{ws._count.boards}</td>
                <td className="px-4 py-3 text-center text-xs">{new Date(ws.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-center">
                  <AdminDeleteButton type="workspace" id={ws.id} label={ws.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex gap-2 justify-end">
          {Array.from({ length: pages }, (_, i) => (
            <a
              key={i}
              href={\`?page=\${i + 1}\`}
              className={\`px-3 py-1 rounded text-xs font-medium \${
                page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }\`}
            >
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 18. ADMIN — login form component
// ═══════════════════════════════════════════════════════════════════════════════
w("src/components/admin/admin-login-form.tsx", `
"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { appToast } from "@/lib/toast";
import { adminLoginAction } from "@/server/actions/admin-auth-actions";

export function AdminLoginForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(adminLoginAction, { success: false, error: "" });

  useEffect(() => {
    if (state.error) appToast.error(state.error);
    if (state.success) { router.push("/admin"); router.refresh(); }
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-slate-300">Admin email</Label>
        <Input
          id="email" name="email" type="email" required autoFocus
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          placeholder="admin@example.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-slate-300">Password</Label>
        <PasswordInput
          id="password" name="password" required
          className="bg-slate-800 border-slate-700 text-white"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full h-11 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in to Admin"}
      </button>
    </form>
  );
}
`);

// ═══════════════════════════════════════════════════════════════════════════════
// 19. ADMIN — delete button component
// ═══════════════════════════════════════════════════════════════════════════════
w("src/components/admin/admin-delete-button.tsx", `
"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { adminDeleteUser, adminDeleteWorkspace } from "@/server/actions/admin-data-actions";
import { appToast } from "@/lib/toast";

export function AdminDeleteButton({
  type, id, label,
}: {
  type: "user" | "workspace"; id: string; label: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function handle() {
    if (!confirm(\`Delete "\${label}"? This cannot be undone.\`)) return;
    start(async () => {
      const res = type === "user"
        ? await adminDeleteUser(id)
        : await adminDeleteWorkspace(id);
      if (res.success) {
        appToast.success(\`"\${label}" deleted\`);
        router.refresh();
      } else {
        appToast.error("Failed to delete");
      }
    });
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-red-400 hover:bg-red-900/30 transition-colors disabled:opacity-40"
    >
      <Trash2 className="size-3" />
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
`);

console.log("\\n✅ All files written successfully.");
