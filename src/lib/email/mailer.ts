import { prisma } from "@/lib/prisma";

type MailPayload = {
  to: string;
  subject: string;
  text: string;
};

type MailTransporter = {
  sendMail: (payload: {
    from: string;
    to: string;
    subject: string;
    text: string;
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
  });
}

export async function sendEmailToUser(userId: string, subject: string, text: string) {
  try {
    const recipient = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!recipient?.email) {
      return;
    }

    await sendMail({ to: recipient.email, subject, text });
  } catch {
    return;
  }
}
