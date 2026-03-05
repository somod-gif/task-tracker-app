import { prisma } from "@/lib/prisma";

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type MailTransporter = {
  sendMail: (payload: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
  }) => Promise<unknown>;
};

type MailModule = {
  createTransport: (config: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  }) => MailTransporter;
};

async function sendMail(payload: MailPayload) {
  const dynamicImport = new Function("modulePath", "return import(modulePath)") as (modulePath: string) => Promise<MailModule>;
  const nodemailer = await dynamicImport("nodemailer");

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? user,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}

function buildTemplate({
  heading,
  message,
  ctaLabel,
  ctaLink,
}: {
  heading: string;
  message: string;
  ctaLabel: string;
  ctaLink: string;
}) {
  return `
  <div style="background:#f4f7fb;padding:24px;font-family:Arial,sans-serif;color:#262166;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e4e8ef;border-radius:12px;overflow:hidden;">
      <div style="background:#262166;padding:18px 24px;color:#ffffff;font-size:20px;font-weight:700;">Sprint Desk</div>
      <div style="padding:24px;">
        <h2 style="margin:0 0 12px;font-size:22px;color:#262166;">${heading}</h2>
        <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#4a5160;">${message}</p>
        <a href="${ctaLink}" style="display:inline-block;background:#1593c6;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;">${ctaLabel}</a>
      </div>
      <div style="padding:14px 24px;background:#f7f9fc;color:#718096;font-size:12px;border-top:1px solid #edf0f5;">
        You are receiving this email from Sprint Desk notifications.
      </div>
    </div>
  </div>`;
}

function resolveEmailContent(type: "TASK_ASSIGNED" | "TASK_UPDATED" | "TASK_OVERDUE" | "SPRINT_ASSIGNED" | "COMPANY_APPROVED" | "SYSTEM", title: string, message: string) {
  if (type === "COMPANY_APPROVED") {
    return {
      subject: "Your Company Has Been Approved - Sprint Desk",
      html: buildTemplate({
        heading: "Company approved",
        message,
        ctaLabel: "Open Dashboard",
        ctaLink: "/dashboard",
      }),
    };
  }

  if (type === "TASK_ASSIGNED") {
    return {
      subject: "New Task Assigned to You",
      html: buildTemplate({
        heading: title,
        message,
        ctaLabel: "View My Tasks",
        ctaLink: "/dashboard/my-tasks",
      }),
    };
  }

  if (type === "TASK_OVERDUE") {
    return {
      subject: "Task Deadline Missed",
      html: buildTemplate({
        heading: title,
        message,
        ctaLabel: "Review Task",
        ctaLink: "/dashboard/my-tasks",
      }),
    };
  }

  if (type === "SPRINT_ASSIGNED") {
    return {
      subject: "New Sprint Assigned to Your Department",
      html: buildTemplate({
        heading: title,
        message,
        ctaLabel: "Open Sprint Board",
        ctaLink: "/dashboard/sprint-board",
      }),
    };
  }

  return {
    subject: `[Sprint Desk] ${title}`,
    html: buildTemplate({
      heading: title,
      message,
      ctaLabel: "Open Notifications",
      ctaLink: "/dashboard/notifications",
    }),
  };
}

export async function sendEmailToUser({
  userId,
  type,
  title,
  message,
}: {
  userId: string;
  companyId?: string;
  type: "TASK_ASSIGNED" | "TASK_UPDATED" | "TASK_OVERDUE" | "SPRINT_ASSIGNED" | "COMPANY_APPROVED" | "SYSTEM";
  title: string;
  message: string;
}) {
  try {
    const recipient = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!recipient?.email) {
      return;
    }

    const emailContent = resolveEmailContent(type, title, message);
    await sendMail({ to: recipient.email, subject: emailContent.subject, text: message, html: emailContent.html });
  } catch {
    return;
  }
}

// ─── Invitation Email ─────────────────────────────────────────────────────────
export async function sendInvitationEmail({
  to,
  inviterName,
  workspaceName,
  inviteToken,
}: {
  to: string;
  inviterName: string;
  workspaceName: string;
  inviteToken: string;
}) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const inviteLink = `${appUrl}/invite/${inviteToken}`;

    await sendMail({
      to,
      subject: `${inviterName} invited you to "${workspaceName}" on Sprint Desk`,
      text: `You've been invited to join "${workspaceName}" on Sprint Desk. Accept here: ${inviteLink}`,
      html: buildTemplate({
        heading: `You're invited to "${workspaceName}"`,
        message: `<strong>${inviterName}</strong> has invited you to collaborate on <strong>${workspaceName}</strong> in Sprint Desk.`,
        ctaLabel: "Accept Invitation",
        ctaLink: inviteLink,
      }),
    });
  } catch {
    // Email failures are non-blocking
    return;
  }
}
