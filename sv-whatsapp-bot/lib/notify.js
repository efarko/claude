import nodemailer from 'nodemailer';
import fs from 'node:fs';

let transport;

// Avisa a Franco por correo. MAIL_LOG=<archivo> lo escribe en un archivo (solo pruebas locales).
export async function notifyFranco({ subject, text }) {
  const to = process.env.OWNER_EMAIL;
  if (process.env.MAIL_LOG) {
    fs.appendFileSync(process.env.MAIL_LOG, JSON.stringify({ to, subject, text }) + '\n');
    return;
  }
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!to || !user || !pass) throw new Error('Faltan OWNER_EMAIL / GMAIL_USER / GMAIL_APP_PASSWORD');
  transport ||= nodemailer.createTransport({ service: 'gmail', auth: { user, pass: pass.replace(/\s+/g, '') } });
  await transport.sendMail({ from: `"Bot WhatsApp SV WebStudio" <${user}>`, to, subject, text });
}
