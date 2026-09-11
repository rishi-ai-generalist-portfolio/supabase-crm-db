// lib/mailer.js
// Shared nodemailer transporter + send helper.
// Reads SMTP settings from environment variables — see .env.example.
// This file did not exist before; it's new.
import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587/others
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

// Fire-and-log — a failed email should never block the underlying
// lead/deal write from succeeding, so this never throws.
export async function sendMail({ to, subject, html, text }) {
  if (!to) {
    console.warn('sendMail called with no recipient — skipping:', subject);
    return;
  }
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('SMTP is not configured — skipping email send:', subject);
    return;
  }
  try {
    const t = getTransporter();
    await t.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text: text || undefined,
      html,
    });
  } catch (err) {
    console.error('Failed to send email:', subject, err);
  }
}
