import { ensureDb, setPause } from '../lib/db.js';
import { validSign } from '../lib/control.js';

const LABEL = { pause: 'Callar el bot en este chat', resume: 'Volver a encender el bot en este chat' };

function page(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Bot WhatsApp</title>
<style>body{font:17px/1.5 system-ui,sans-serif;max-width:420px;margin:48px auto;padding:0 20px;color:#0e142a}button{font:inherit;font-weight:600;background:#2d87ff;color:#fff;border:0;border-radius:12px;padding:14px 20px;width:100%}</style></head><body>${body}</body></html>`);
}

const esc = (s) => String(s).replace(/[^0-9a-z]/gi, '');

// GET muestra un botón (así los antivirus que abren los links del correo no cambian nada); POST aplica el cambio.
export default async function handler(req, res) {
  const q = new URL(req.url, 'http://x').searchParams;
  const wa = esc(q.get('wa') || '');
  const a = q.get('a');
  const s = esc(q.get('s') || '');
  if (!wa || !LABEL[a] || !validSign(wa, a, s)) return page(res, 403, '<p>Este link no es válido.</p>');

  if (req.method === 'GET') {
    return page(res, 200, `<p>Chat con +${wa}</p><form method="post" action="?wa=${wa}&a=${a}&s=${s}"><button>${LABEL[a]}</button></form>`);
  }
  if (req.method !== 'POST') return page(res, 405, '<p>Método no permitido.</p>');
  await ensureDb();
  await setPause(wa, a === 'pause' ? null : 0);
  return page(res, 200, `<p>Listo: ${a === 'pause' ? 'el bot ya no responderá en este chat. Ahora lo atiendes tú.' : 'el bot vuelve a responder en este chat.'}</p>`);
}
