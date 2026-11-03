// Prueba local sin Meta ni Claude reales: simula ambos con un fetch falso.
// Uso: DATABASE_URL=postgres://... node scripts/test.mjs
import crypto from 'node:crypto';
import fs from 'node:fs';
import { Readable } from 'node:stream';
import assert from 'node:assert/strict';

process.env.WA_APP_SECRET = 'secreto-de-prueba';
process.env.WA_VERIFY_TOKEN = 'verificar';
process.env.WA_TOKEN = 'token';
process.env.WA_PHONE_NUMBER_ID = '123';
process.env.ANTHROPIC_API_KEY = 'sk-ant-prueba';
process.env.BOT_ADMIN_SECRET = 'admin';
process.env.BOT_URL = 'https://bot.example';
process.env.OWNER_EMAIL = 'franco@example.com';
process.env.BOT_WAIT_MS = '300';
process.env.MAIL_LOG = '/tmp/svbot-mail.log';
fs.rmSync(process.env.MAIL_LOG, { force: true });

const sent = [];
let claudeCalls = [];
let claudeDown = false;
let nextReply = { respuesta: 'Hola, ¿cómo se llama su negocio?', avisar_a_franco: false, motivo: '', etapa: 'consulta', negocio: '' };

globalThis.fetch = async (url, init = {}) => {
  const u = String(url);
  const body = init.body ? JSON.parse(init.body) : null;
  if (u.includes('graph.facebook.com')) {
    sent.push(body);
    return new Response(JSON.stringify({ messages: [{ id: `wamid.out${sent.length}` }] }), { status: 200 });
  }
  if (u.includes('api.anthropic.com')) {
    if (claudeDown) return new Response(JSON.stringify({ type: 'error', error: { type: 'invalid_request_error', message: 'caído' } }), { status: 400 });
    claudeCalls.push({ body, beta: new Headers(init.headers).get('anthropic-beta') || '' });
    return new Response(JSON.stringify({
      id: 'msg_1', type: 'message', role: 'assistant', model: body.model, stop_reason: 'end_turn',
      content: [{ type: 'text', text: JSON.stringify(nextReply) }],
      usage: { input_tokens: 10, output_tokens: 10 },
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  throw new Error(`fetch inesperado: ${u}`);
};

const { default: webhook, processPayload } = await import('../api/webhook.js');
const { default: control } = await import('../api/control.js');
const { sql, ensureDb } = await import('../lib/db.js');
const { controlLink } = await import('../lib/control.js');

await ensureDb();
await sql`truncate wa_messages, wa_chats`;

function fakeRes() {
  return { statusCode: 0, headers: {}, body: '', setHeader(k, v) { this.headers[k] = v; }, end(b = '') { this.body = String(b); } };
}
function fakeReq(method, url, body, headers = {}) {
  const r = Readable.from(body ? [Buffer.from(body)] : []);
  Object.assign(r, { method, url, headers });
  return r;
}
const textMsg = (from, id, text) => ({ entry: [{ changes: [{ value: {
  contacts: [{ wa_id: from, profile: { name: 'Xavier' } }],
  messages: [{ from, id, type: 'text', text: { body: text } }],
} }] }] });

// 1. Verificación del webhook.
let res = fakeRes();
await webhook(fakeReq('GET', '/api/webhook?hub.mode=subscribe&hub.verify_token=verificar&hub.challenge=42'), res);
assert.equal(res.statusCode, 200); assert.equal(res.body, '42');
res = fakeRes();
await webhook(fakeReq('GET', '/api/webhook?hub.mode=subscribe&hub.verify_token=mal&hub.challenge=42'), res);
assert.equal(res.statusCode, 403);

// 2. Firma inválida.
res = fakeRes();
await webhook(fakeReq('POST', '/api/webhook', '{}', { 'x-hub-signature-256': 'sha256=00' }), res);
assert.equal(res.statusCode, 401);

// 3. Firma válida: responde 200 (el procesamiento corre aparte).
const raw = JSON.stringify(textMsg('51999000111', 'wamid.in0', 'hola'));
const sig = 'sha256=' + crypto.createHmac('sha256', 'secreto-de-prueba').update(raw).digest('hex');
res = fakeRes();
await webhook(fakeReq('POST', '/api/webhook', raw, { 'x-hub-signature-256': sig }), res);
assert.equal(res.statusCode, 200);
await new Promise((r) => setTimeout(r, 1500));
await sql`truncate wa_messages, wa_chats`;
sent.length = 0; claudeCalls = [];

// 4. Dos mensajes seguidos: una sola respuesta, con los dos en el historial.
await Promise.all([
  processPayload(textMsg('51999000111', 'wamid.in1', 'Hola, vi su correo')),
  new Promise((r) => setTimeout(r, 100)).then(() => processPayload(textMsg('51999000111', 'wamid.in2', '¿Cuánto cuesta?'))),
]);
const texts = sent.filter((s) => s.type === 'text');
assert.equal(texts.length, 1, 'debe responder una sola vez');
assert.equal(texts[0].to, '51999000111');
assert.equal(claudeCalls.length, 1);
const call = claudeCalls[0].body;
assert.equal(call.model, 'claude-opus-5-5');
assert.equal(call.fallbacks, 'default');
assert.equal(call.output_config.format.type, 'json_schema');
assert.equal(call.messages.length, 1);
assert.match(call.messages[0].content, /vi su correo[\s\S]*Cuánto cuesta/);
assert.ok(claudeCalls[0].beta.includes('server-side-fallback-2026-07-01'));

// 5. Reenvío duplicado de Meta: no responde de nuevo.
sent.length = 0;
await processPayload(textMsg('51999000111', 'wamid.in2', '¿Cuánto cuesta?'));
assert.equal(sent.filter((s) => s.type === 'text').length, 0);

// 6. Aviso a Franco con los links de control.
nextReply = { respuesta: 'Le consulto a Franco y le escribe en breve.', avisar_a_franco: true, motivo: 'Pide descuento', etapa: 'evaluando', negocio: 'Adrianzen' };
await processPayload(textMsg('51999000111', 'wamid.in3', '¿Me hace descuento?'));
const mails = fs.readFileSync(process.env.MAIL_LOG, 'utf8').trim().split('\n').map(JSON.parse);
assert.equal(mails.length, 1);
assert.match(mails[0].subject, /Pide descuento · Adrianzen/);
assert.match(mails[0].text, /wa\.me\/51999000111/);
assert.ok(mails[0].text.includes(controlLink('51999000111', 'pause')));
const [chat] = await sql`select * from wa_chats where wa_id = '51999000111'`;
assert.equal(chat.business, 'Adrianzen'); assert.equal(chat.stage, 'evaluando');

// 7. Franco escribe desde la app: el bot se calla en ese chat.
await processPayload({ entry: [{ changes: [{ field: 'smb_message_echoes', value: {
  message_echoes: [{ from: '51957636046', to: '51999000111', id: 'wamid.echo1', type: 'text', text: { body: 'Hola Xavier, te escribo yo' } }],
} }] }] });
sent.length = 0; claudeCalls = [];
await processPayload(textMsg('51999000111', 'wamid.in4', 'ok gracias'));
assert.equal(sent.filter((s) => s.type === 'text').length, 0, 'pausado tras mensaje de Franco');
assert.equal(claudeCalls.length, 0);

// 8. Link de control: GET no cambia nada, POST reactiva.
const link = new URL(controlLink('51999000111', 'resume'));
res = fakeRes();
await control(fakeReq('GET', link.pathname + link.search), res);
assert.equal(res.statusCode, 200); assert.match(res.body, /<form method="post"/);
let [c2] = await sql`select paused_until from wa_chats where wa_id = '51999000111'`;
assert.ok(c2.paused_until, 'GET no debe reactivar');
res = fakeRes();
await control(fakeReq('POST', link.pathname + link.search), res);
[c2] = await sql`select paused_until from wa_chats where wa_id = '51999000111'`;
assert.equal(c2.paused_until, null);
res = fakeRes();
await control(fakeReq('GET', link.pathname + link.search.replace(/s=[^&]+/, 's=' + '0'.repeat(32))), res);
assert.equal(res.statusCode, 403);

// 9. Historial con el mensaje de Franco marcado y sin turnos seguidos del mismo rol.
nextReply = { respuesta: 'Perfecto.', avisar_a_franco: false, motivo: '', etapa: 'evaluando', negocio: 'Adrianzen' };
await processPayload(textMsg('51999000111', 'wamid.in5', 'listo, ¿cómo pago?'));
const msgs = claudeCalls.at(-1).body.messages;
assert.equal(msgs.at(-1).role, 'user');
for (let i = 1; i < msgs.length; i++) assert.notEqual(msgs[i].role, msgs[i - 1].role);
assert.ok(msgs.some((m) => m.role === 'assistant' && m.content.includes('(Franco escribió) Hola Xavier')));

// 10. Si Claude falla, el cliente recibe un mensaje amable y Franco un aviso.
claudeDown = true;
sent.length = 0;
await processPayload(textMsg('51988000222', 'wamid.x1', 'hola'));
assert.match(sent.find((s) => s.type === 'text').text.body, /Franco le responde/);
assert.equal(fs.readFileSync(process.env.MAIL_LOG, 'utf8').trim().split('\n').length, 2);

console.log('OK: todas las pruebas pasaron');
await sql.end();
