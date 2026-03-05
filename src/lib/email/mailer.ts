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
    const t = nodemailer.createTransport({ host, port, secure: port === 465, requireTLS: port !== 465, auth: { user, pass } });
    await t.sendMail({
      from: process.env.SMTP_FROM ?? `Sprint Desk <${user}>`,
      to: mail.to, subject: mail.subject, html: mail.html,
    });
  } catch (e) { console.error("[mailer] send error:", e); }
}

function wrap(body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
<tr><td style="background:${P};padding:20px 32px;"><span style="font-size:22px;font-weight:700;color:#fff;">&#9889; Sprint Desk</span></td></tr>
<tr><td style="padding:32px;">${body}</td></tr>
<tr><td style="background:#f7f9fc;padding:14px 32px;border-top:1px solid #edf0f5;">
<p style="margin:0;font-size:11px;color:#9aa5b4;">This email was sent by Sprint Desk. If you did not expect it, you can safely ignore it. &copy; ${new Date().getFullYear()} Sprint Desk.</p>
</td></tr></table></td></tr></table></body></html>`;
}

const cta = (label: string, href: string) =>
  `<a href="${href}" style="display:inline-block;background:${A};color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;margin-top:20px;">${label} &rarr;</a>`;

const hr = () => `<hr style="border:none;border-top:1px solid #edf0f5;margin:24px 0;">`;

const row = (k: string, v: string) =>
  `<tr><td style="padding:4px 0;font-size:13px;color:#6b7280;width:140px;">${k}</td><td style="padding:4px 0;font-size:13px;color:#111827;font-weight:500;">${v}</td></tr>`;

const tbl = (rows: string) =>
  `<table cellpadding="0" cellspacing="0" style="background:#f7f9fc;border:1px solid #edf0f5;border-radius:8px;padding:16px;width:100%;"><tbody>${rows}</tbody></table>`;

const warn = (msg: string) =>
  `<div style="background:#fff8e1;border:1px solid #fbbf24;border-radius:8px;padding:14px;margin-top:20px;"><p style="margin:0;font-size:13px;color:#92400e;">${msg}</p></div>`;

const h2 = (t: string) => `<h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:${P};">${t}</h2>`;
const p  = (t: string) => `<p style="margin:0 0 16px;font-size:14px;color:#4a5568;line-height:1.7;">${t}</p>`;

export async function sendWelcomeEmail({ to, name }: { to: string; name: string }) {
  await send({
    to, subject: "Welcome to Sprint Desk",
    html: wrap(
      h2(`Welcome, ${name}!`) +
      p("Your Sprint Desk account is ready. Build Kanban boards, invite your team, and ship projects faster.") +
      `<ol style="margin:0 0 16px;padding-left:20px;font-size:14px;color:#4a5568;line-height:2.2;">
        <li>Create your first <strong>workspace</strong></li>
        <li>Invite teammates by email</li>
        <li>Build a <strong>board</strong> and add cards</li>
        <li>Drag cards from <em>To Do</em> to <em>Done</em></li>
      </ol>` +
      cta("Open Sprint Desk", `${APP_URL}/workspace`) +
      hr() +
      `<p style="margin:0;font-size:12px;color:#9aa5b4;">Account email: <strong>${to}</strong></p>`
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
      p(`Hi <strong>${name}</strong>, a sign-in to your Sprint Desk account was just recorded.`) +
      tbl(row("Account", to) + row("Time", time) + row("Device", userAgent ? userAgent.slice(0, 80) : "Unknown")) +
      warn("<strong>Wasn&apos;t you?</strong> Change your password immediately.") +
      cta("Change My Password", `${APP_URL}/forgot-password`)
    ),
  });
}

export async function sendPasswordResetEmail({
  to, name, resetToken,
}: { to: string; name: string; resetToken: string }) {
  const link = `${APP_URL}/reset-password?token=${resetToken}`;
  await send({
    to, subject: "Reset Your Sprint Desk Password",
    html: wrap(
      h2("Reset Your Password") +
      p(`Hi <strong>${name}</strong>, we received a request to reset your password. This link expires in <strong>1 hour</strong>.`) +
      cta("Reset Password", link) +
      hr() +
      `<p style="font-size:12px;color:#9aa5b4;margin:0;">
        Didn&apos;t request this? Ignore this email.<br><br>
        Link: <a href="${link}" style="color:${A};">${link}</a>
      </p>`
    ),
  });
}

export async function sendWorkspaceInviteEmail({
  to, inviterName, workspaceName, workspaceId,
}: { to: string; inviterName: string; workspaceName: string; workspaceId: string }) {
  await send({
    to, subject: `You were added to "${workspaceName}" on Sprint Desk`,
    html: wrap(
      h2("You have been added to a workspace") +
      p(`<strong>${inviterName}</strong> added you to <strong>"${workspaceName}"</strong> on Sprint Desk.`) +
      cta(`Open "${workspaceName}"`, `${APP_URL}/workspace/${workspaceId}`)
    ),
  });
}

export async function sendInvitationEmail({
  to, inviterName, workspaceName, inviteToken,
}: { to: string; inviterName: string; workspaceName: string; inviteToken: string }) {
  const link = `${APP_URL}/invite/${inviteToken}`;
  await send({
    to, subject: `${inviterName} invited you to "${workspaceName}" on Sprint Desk`,
    html: wrap(
      h2("You have been invited to Sprint Desk") +
      p(`<strong>${inviterName}</strong> invited you to join <strong>"${workspaceName}"</strong>. This link expires in <strong>7 days</strong>.`) +
      cta("Accept Invitation", link) +
      hr() +
      `<p style="font-size:12px;color:#9aa5b4;margin:0;">Link: <a href="${link}" style="color:${A};">${link}</a></p>`
    ),
  });
}

export async function sendCardAssignedEmail({
  to, name, assignerName, cardTitle, boardTitle, cardLink,
}: { to: string; name: string; assignerName: string; cardTitle: string; boardTitle: string; cardLink: string }) {
  await send({
    to, subject: `You were assigned: "${cardTitle}"`,
    html: wrap(
      h2("Task Assigned to You") +
      p(`Hi <strong>${name}</strong>, <strong>${assignerName}</strong> assigned you to a task.`) +
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
    subject: `[Sprint Desk] ${title}`,
    html: wrap(h2(title) + p(message) + cta("Open Sprint Desk", `${APP_URL}/workspace`)),
  });
}
