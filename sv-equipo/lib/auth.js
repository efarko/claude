import crypto from 'node:crypto';
import { sql, getSecret } from './db.js';
import { cookies, fail } from './http.js';

export const SESSION_HOURS = 12;

export function newCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

export function newToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function sha(v) {
  return crypto.createHash('sha256').update(v).digest('hex');
}

// Código de acceso firmado con el secreto y atado al usuario.
export function hashCode(userId, code) {
  return crypto.createHmac('sha256', getSecret()).update(`${userId}:${code}`).digest('hex');
}

export function sameHash(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function normEmail(e) {
  return String(e || '').trim().toLowerCase();
}

export function validEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length <= 120;
}

// Devuelve el usuario de la sesión (con los permisos de su rol) o corta con 401.
export async function currentUser(req, { owner = false } = {}) {
  const token = cookies(req).sv_s;
  if (!token) fail(401, 'Inicia sesión');
  const [u] = await sql`
    select u.id, u.email, u.name, u.phone, u.role, u.status,
           r.label as role_label, r.can_wa, r.can_calls, r.wa_daily, r.call_batch, r.is_owner
      from sessions s
      join users u on u.id = s.user_id
      join roles r on r.name = u.role
     where s.token_hash = ${sha(token)} and s.expires_at > now()`;
  if (!u || u.status !== 'active') fail(401, 'Inicia sesión');
  if (owner && !u.is_owner) fail(403, 'Solo el dueño puede ver esto');
  return u;
}

export function firstName(name) {
  return String(name || '').trim().split(/\s+/)[0] || 'el equipo';
}
