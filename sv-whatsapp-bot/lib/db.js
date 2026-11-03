import postgres from 'postgres';
import { SCHEMA } from './schema.js';

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) throw new Error('Falta DATABASE_URL (conecta la base de datos en Vercel → Storage)');
const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url) || url.includes('host=/');

export const sql = postgres(url, {
  max: 1,
  prepare: false,
  idle_timeout: 20,
  connect_timeout: 15,
  ssl: local ? false : 'require',
  onnotice: () => {},
});

let ready;

// Crea las tablas la primera vez.
export function ensureDb() {
  ready ||= sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(727002)`;
    await tx.unsafe(SCHEMA).simple();
  }).catch((e) => { ready = null; throw e; });
  return ready;
}

// Guarda un mensaje. Devuelve false si ya estaba (Meta reenvía el mismo evento a veces).
export async function saveMessage({ waId, role, body, msgId = null, name = null }) {
  const rows = await sql`insert into wa_messages (wa_id, role, body, msg_id)
    values (${waId}, ${role}, ${body}, ${msgId}) on conflict (msg_id) do nothing returning id`;
  await sql`insert into wa_chats (wa_id, name) values (${waId}, ${name})
    on conflict (wa_id) do update set name = coalesce(excluded.name, wa_chats.name), updated_at = now()`;
  return rows.length ? rows[0].id : false;
}

export async function getChat(waId) {
  const [chat] = await sql`select * from wa_chats where wa_id = ${waId}`;
  return chat;
}

export async function history(waId, limit = 40) {
  const rows = await sql`select role, body from wa_messages where wa_id = ${waId} order by id desc limit ${limit}`;
  return rows.reverse();
}

export async function lastUserMessageId(waId) {
  const [row] = await sql`select max(id) as id from wa_messages where wa_id = ${waId} and role = 'user'`;
  return row?.id ? Number(row.id) : 0;
}

// hours = null pausa sin límite; 0 reactiva el bot.
export async function setPause(waId, hours) {
  const until = hours === 0 ? null : hours === null ? new Date('9999-01-01') : new Date(Date.now() + hours * 3600e3);
  await sql`insert into wa_chats (wa_id, paused_until) values (${waId}, ${until})
    on conflict (wa_id) do update set paused_until = excluded.paused_until, updated_at = now()`;
}

export async function updateChat(waId, { stage, business }) {
  await sql`update wa_chats set stage = coalesce(${stage || null}, stage),
    business = coalesce(${business || null}, business), updated_at = now() where wa_id = ${waId}`;
}
