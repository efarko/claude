import crypto from 'node:crypto';

const version = () => process.env.WA_GRAPH_VERSION || 'v23.0';

// Meta firma cada aviso con el secreto de la app: así sabemos que viene de Meta.
export function validSignature(raw, header) {
  const secret = process.env.WA_APP_SECRET;
  if (!secret || !header?.startsWith('sha256=')) return false;
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const given = header.slice(7);
  return given.length === expected.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

async function graph(body) {
  const res = await fetch(`https://graph.facebook.com/${version()}/${process.env.WA_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.WA_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', ...body }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`WhatsApp ${res.status}: ${JSON.stringify(data.error || data).slice(0, 300)}`);
  return data;
}

export async function sendText(to, text) {
  const data = await graph({ to, type: 'text', text: { body: text, preview_url: true } });
  return data.messages?.[0]?.id || null;
}

export async function markRead(messageId) {
  await graph({ status: 'read', message_id: messageId }).catch(() => {});
}

// Convierte un mensaje entrante en texto para el historial.
export function describe(m) {
  switch (m.type) {
    case 'text': return m.text?.body || '';
    case 'button': return m.button?.text || '';
    case 'interactive': return m.interactive?.button_reply?.title || m.interactive?.list_reply?.title || '[respuesta de un botón]';
    case 'image': return `[El cliente envió una imagen${m.image?.caption ? `: "${m.image.caption}"` : ''}]`;
    case 'document': return `[El cliente envió un documento${m.document?.filename ? ` (${m.document.filename})` : ''}]`;
    case 'audio': return '[El cliente envió un audio de voz]';
    case 'video': return '[El cliente envió un video]';
    case 'location': return `[El cliente envió una ubicación${m.location?.address ? `: ${m.location.address}` : ''}]`;
    case 'sticker': return '[El cliente envió un sticker]';
    case 'reaction': return '';
    default: return `[El cliente envió un mensaje de tipo ${m.type}]`;
  }
}
