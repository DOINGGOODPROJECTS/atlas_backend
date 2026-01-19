import nodemailer from 'nodemailer';

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

export type MailResult = {
  messageId?: string;
  response?: string;
};

export async function sendMail(payload: MailPayload): Promise<MailResult> {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error('Gmail transport is not configured.');
  }

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.GMAIL_USER,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });

  return { messageId: info.messageId, response: info.response };
}
