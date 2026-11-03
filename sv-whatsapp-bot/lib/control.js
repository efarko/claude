import crypto from 'node:crypto';

// Firma los links de "callar / encender el bot" del correo de aviso para que nadie más pueda usarlos.
export function sign(waId, action) {
  const secret = process.env.BOT_ADMIN_SECRET;
  if (!secret) throw new Error('Falta BOT_ADMIN_SECRET');
  return crypto.createHmac('sha256', secret).update(`${waId}:${action}`).digest('hex').slice(0, 32);
}

export function validSign(waId, action, sig) {
  if (typeof sig !== 'string' || sig.length !== 32) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(sign(waId, action)));
}

export function controlLink(waId, action) {
  const base = (process.env.BOT_URL || '').replace(/\/$/, '');
  return `${base}/api/control?wa=${waId}&a=${action}&s=${sign(waId, action)}`;
}
