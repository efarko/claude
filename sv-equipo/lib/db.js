import postgres from 'postgres';
import crypto from 'node:crypto';
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
let secret;

// Crea las tablas la primera vez y carga el secreto para firmar códigos.
export function ensureDb() {
  ready ||= (async () => {
    await sql.begin(async (tx) => {
      await tx`select pg_advisory_xact_lock(727001)`;
      await tx.unsafe(SCHEMA).simple();
      await tx`insert into meta (k, v) values ('secret', ${crypto.randomBytes(32).toString('hex')}) on conflict do nothing`;
    });
    const [row] = await sql`select v from meta where k = 'secret'`;
    secret = row.v;
  })().catch((e) => { ready = null; throw e; });
  return ready;
}

export function getSecret() {
  return secret;
}

// Fecha de hoy en Lima (YYYY-MM-DD). SV_FAKE_TODAY solo sirve para pruebas locales.
export function today() {
  if (process.env.SV_FAKE_TODAY && process.env.NODE_ENV === 'test') return process.env.SV_FAKE_TODAY;
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
}

export function addDays(day, n) {
  const d = new Date(day + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export async function log(db, { userId = null, kind, prospectId = null, result = null, note = null, ip = null }) {
  await db`insert into activity (day, user_id, kind, prospect_id, result, note, ip)
           values (${today()}, ${userId}, ${kind}, ${prospectId}, ${result}, ${note}, ${ip})`;
}
