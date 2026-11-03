import { waitUntil } from '@vercel/functions';
import { ensureDb, saveMessage, getChat, history, lastUserMessageId, setPause, updateChat } from '../lib/db.js';
import { validSignature, sendText, markRead, describe } from '../lib/wa.js';
import { decide } from '../lib/brain.js';
import { notifyFranco } from '../lib/notify.js';
import { controlLink } from '../lib/control.js';

// Segundos que espera el bot por si el cliente sigue escribiendo, para responder todo junto.
const WAIT_MS = Number(process.env.BOT_WAIT_MS ?? 6000);
// Horas que el bot se calla en un chat después de que Franco escribe desde su celular.
const HUMAN_HOURS = Number(process.env.BOT_HUMAN_HOURS ?? 12);

async function readRaw(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  // Meta verifica el webhook una vez con un GET.
  if (req.method === 'GET') {
    const q = new URL(req.url, 'http://x').searchParams;
    if (q.get('hub.mode') === 'subscribe' && q.get('hub.verify_token') === process.env.WA_VERIFY_TOKEN) {
      res.statusCode = 200;
      return res.end(q.get('hub.challenge'));
    }
    res.statusCode = 403;
    return res.end();
  }
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end();
  }

  const raw = await readRaw(req);
  if (!validSignature(raw, req.headers['x-hub-signature-256'])) {
    res.statusCode = 401;
    return res.end();
  }
  let payload;
  try { payload = JSON.parse(raw.toString('utf8')); } catch { payload = null; }

  // Meta pide respuesta rápida: contestamos 200 y procesamos después.
  res.statusCode = 200;
  res.end();
  if (payload) waitUntil(processPayload(payload).catch((e) => console.error('webhook', e)));
}

export async function processPayload(payload) {
  await ensureDb();
  const toAnswer = new Map();
  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const v = change.value || {};

      // Mensajes de clientes.
      const names = Object.fromEntries((v.contacts || []).map((c) => [c.wa_id, c.profile?.name || null]));
      for (const m of v.messages || []) {
        const body = describe(m);
        if (!body) continue;
        const id = await saveMessage({ waId: m.from, role: 'user', body, msgId: m.id, name: names[m.from] });
        if (id) toAnswer.set(m.from, { rowId: id, msgId: m.id });
      }

      // Mensajes que Franco manda desde la app de WhatsApp Business (coexistencia).
      for (const m of v.message_echoes || []) {
        const body = m.text?.body?.trim() || (m.type && m.type !== 'text' ? `[Franco envió un ${m.type}]` : '');
        if (!body || !m.to) continue;
        if (await saveMessage({ waId: m.to, role: 'franco', body, msgId: m.id })) await setPause(m.to, HUMAN_HOURS);
      }
    }
  }
  if (!toAnswer.size) return;
  if (WAIT_MS) await new Promise((r) => setTimeout(r, WAIT_MS));
  await Promise.all([...toAnswer].map(([waId, m]) => answer(waId, m)));
}

async function answer(waId, { rowId, msgId }) {
  // Si llegó otro mensaje del cliente mientras esperábamos, ese aviso responde todo.
  if ((await lastUserMessageId(waId)) !== Number(rowId)) return;
  const chat = await getChat(waId);
  if (chat?.paused_until && new Date(chat.paused_until) > new Date()) return;

  await markRead(msgId);
  const rows = await history(waId);
  const out = await decide(rows);
  if (!out) return;
  await updateChat(waId, { stage: out.etapa, business: out.negocio });

  if (out.respuesta.trim()) {
    try {
      const sentId = await sendText(waId, out.respuesta);
      await saveMessage({ waId, role: 'assistant', body: out.respuesta, msgId: sentId });
    } catch (e) {
      out.avisar_a_franco = true;
      out.motivo = `No se pudo enviar la respuesta por WhatsApp (${e.message})`;
    }
  }

  if (out.avisar_a_franco) {
    const name = chat?.name || 'Sin nombre';
    const transcript = rows.concat(out.respuesta ? [{ role: 'assistant', body: out.respuesta }] : [])
      .slice(-12)
      .map((r) => `${r.role === 'user' ? 'Cliente' : r.role === 'franco' ? 'Franco' : 'Bot'}: ${r.body}`)
      .join('\n');
    await notifyFranco({
      subject: `[Bot WhatsApp] ${out.motivo || out.etapa} · ${out.negocio || name}`,
      text: `${out.motivo || 'El bot pide que revises esta conversación.'}\n\n`
        + `Cliente: ${name} (+${waId})\nNegocio: ${out.negocio || '—'}\nEtapa: ${out.etapa}\n`
        + `Escríbele: https://wa.me/${waId}\n\nÚltimos mensajes:\n${transcript}\n\n`
        + `Si le escribes desde tu WhatsApp, el bot se calla en ese chat por ${HUMAN_HOURS} horas.\n`
        + `Callar el bot en este chat: ${controlLink(waId, 'pause')}\n`
        + `Volver a encender el bot en este chat: ${controlLink(waId, 'resume')}`,
    }).catch((e) => console.error('notify', e));
  }
}
