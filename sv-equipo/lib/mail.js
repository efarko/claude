import nodemailer from 'nodemailer';
import fs from 'node:fs';
import { sql } from './db.js';

let transport;

export function ownerEmail() {
  const e = (process.env.OWNER_EMAIL || '').trim().toLowerCase();
  if (!e) throw new Error('Falta OWNER_EMAIL');
  return e;
}

// Dueño principal + socios activos: reciben solicitudes, interesados y avisos.
export async function ownerEmails() {
  const rows = await sql`select email from users where role = 'socio' and status = 'active'`;
  return [...new Set([ownerEmail(), ...rows.map((r) => r.email)])];
}

// Envía un correo de texto simple. MAIL_LOG=<archivo> lo escribe en un archivo (solo pruebas locales).
export async function sendMail({ to, subject, text }) {
  if (process.env.MAIL_LOG) {
    fs.appendFileSync(process.env.MAIL_LOG, JSON.stringify({ to, subject, text }) + '\n');
    return;
  }
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error('Faltan GMAIL_USER / GMAIL_APP_PASSWORD');
  transport ||= nodemailer.createTransport({ service: 'gmail', auth: { user, pass: pass.replace(/\s+/g, '') } });
  await transport.sendMail({ from: `"SV WebStudio" <${user}>`, to, subject, text });
}
