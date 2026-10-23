// Utilidades HTTP que funcionan igual en Vercel y en el servidor local de pruebas.
import { ensureDb } from './db.js';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const fail = (status, message) => { throw new HttpError(status, message); };

export function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export function query(req) {
  return Object.fromEntries(new URL(req.url, 'http://x').searchParams);
}

async function readBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') return req.body ? JSON.parse(req.body) : {};
    if (Buffer.isBuffer(req.body)) return req.body.length ? JSON.parse(req.body.toString('utf8')) : {};
    return req.body || {};
  }
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 4_000_000) fail(413, 'Archivo demasiado grande');
    chunks.push(c);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export function cookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function isHttps(req) {
  return !!process.env.VERCEL || req.headers['x-forwarded-proto'] === 'https';
}

export function setCookie(req, res, name, value, maxAge) {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`];
  if (isHttps(req)) parts.push('Secure');
  const prev = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', [...(Array.isArray(prev) ? prev : prev ? [prev] : []), parts.join('; ')]);
}

export function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim().slice(0, 60);
}

export function baseUrl(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return `http://${req.headers.host}`;
}

// Las acciones POST exigen la cabecera X-SV y, si viene Origin, que sea este mismo sitio.
function checkPost(req) {
  if (req.headers['x-sv'] !== '1') fail(403, 'Solicitud no válida');
  const origin = req.headers.origin;
  if (origin) {
    let host;
    try { host = new URL(origin).host; } catch { fail(403, 'Solicitud no válida'); }
    const allowed = [req.headers['x-forwarded-host'], req.headers.host].filter(Boolean);
    if (!allowed.includes(host)) fail(403, 'Solicitud no válida');
  }
}

// Envuelve un mapa de acciones: { nombre: { method, run(ctx) } }.
export function handler(actions) {
  return async (req, res) => {
    try {
      const q = query(req);
      const action = actions[q.a];
      if (!action) fail(404, 'Acción desconocida');
      if (req.method !== action.method) fail(405, 'Método no permitido');
      let body = {};
      if (req.method === 'POST') {
        checkPost(req);
        try { body = await readBody(req); } catch (e) { if (e instanceof HttpError) throw e; fail(400, 'JSON no válido'); }
      }
      await ensureDb();
      const out = await action.run({ req, res, q, body, ip: clientIp(req) });
      send(res, 200, out ?? { ok: true });
    } catch (e) {
      if (e instanceof HttpError) return send(res, e.status, { error: e.message });
      console.error(e);
      send(res, 500, { error: 'Error del servidor. Intenta de nuevo.' });
    }
  };
}
