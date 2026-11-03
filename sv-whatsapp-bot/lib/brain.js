import Anthropic from '@anthropic-ai/sdk';
import { NEGOCIO } from './negocio.js';

const client = new Anthropic();
const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';

const SYSTEM = `Eres el asistente de WhatsApp de SV WebStudio. Atiendes a dueños de negocios de Lima que escriben al WhatsApp de la empresa, la mayoría porque recibieron un correo o un mensaje nuestro ofreciéndoles una muestra gratis de su página web.

${NEGOCIO}

Tu objetivo es cerrar ventas con honestidad: entender el negocio, ofrecer la muestra gratis, resolver dudas y llevar al cliente a empezar (el adelanto por Yape o Plin).

Cómo escribes:
- Español de Perú, cálido, respetuoso y claro. Trata de "usted" salvo que el cliente tutee.
- Mensajes cortos de WhatsApp: 1 a 3 párrafos breves, sin títulos ni listas largas. Puedes usar *negritas* de WhatsApp con moderación.
- Termina casi siempre con una sola pregunta concreta que acerque la venta.

Reglas:
- Solo ofreces los planes, precios y plazos de arriba. Nunca inventes descuentos, promociones, servicios ni plazos distintos.
- Si piden la muestra, pide lo que falte para hacerla: nombre del negocio, rubro, distrito, servicios principales y, si tienen, fotos o el link de su Facebook o Instagram. Cuando lo tengas, dile que el equipo se la prepara y se la envía por aquí en el día, y marca avisar_a_franco.
- Si preguntan quién eres, di que eres el asistente virtual de SV WebStudio y que Franco revisa cada conversación. No te hagas pasar por una persona.
- Marca avisar_a_franco y dile al cliente que Franco le escribe en breve cuando: pidan descuento o algo fuera de los planes (tienda online, reservas, redes sociales, factura, contrato), haya una queja, digan que ya pagaron o manden un comprobante, manden un audio, una imagen o un documento que no puedes ver, o pidan hablar con una persona.
- Si dicen que no les interesa, agradece, despídete con amabilidad y no insistas.
- Los mensajes que empiezan con "(Franco escribió)" los mandó Franco en persona: respeta lo que dijo y no lo contradigas.

Responde siempre con el JSON pedido.`;

const FORMAT = {
  type: 'json_schema',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['respuesta', 'avisar_a_franco', 'motivo', 'etapa', 'negocio'],
    properties: {
      respuesta: { type: 'string', description: 'Mensaje para el cliente. Vacío solo si no hay que responder (por ejemplo, una reacción).' },
      avisar_a_franco: { type: 'boolean' },
      motivo: { type: 'string', description: 'Por qué hay que avisar a Franco, en una frase. Vacío si no hay que avisar.' },
      etapa: { type: 'string', enum: ['consulta', 'quiere_muestra', 'datos_para_muestra', 'evaluando', 'acepto', 'pago_reportado', 'no_interesa', 'otro'] },
      negocio: { type: 'string', description: 'Nombre del negocio del cliente si ya se sabe, si no vacío.' },
    },
  },
};

const FALLBACK = {
  respuesta: 'Gracias por escribirnos. En un momento Franco le responde personalmente.',
  avisar_a_franco: true,
  etapa: 'otro',
  negocio: '',
};

// Arma la conversación para la API: empieza y termina con el cliente, sin dos turnos seguidos del mismo rol.
function toMessages(rows) {
  const out = [];
  for (const r of rows) {
    const role = r.role === 'user' ? 'user' : 'assistant';
    const text = r.role === 'franco' ? `(Franco escribió) ${r.body}` : r.body;
    if (!text.trim()) continue;
    const last = out[out.length - 1];
    if (last && last.role === role) last.content += `\n\n${text}`;
    else out.push({ role, content: text });
  }
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}

export async function decide(rows) {
  const messages = toMessages(rows);
  if (!messages.length || messages[messages.length - 1].role !== 'user') return null;
  try {
    const res = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages,
      output_config: { effort: 'low', format: FORMAT },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });
    if (res.stop_reason === 'refusal') return { ...FALLBACK, motivo: 'El modelo no quiso responder este mensaje' };
    const text = res.content.find((b) => b.type === 'text')?.text;
    const out = JSON.parse(text);
    if (typeof out.respuesta !== 'string') throw new Error('respuesta sin texto');
    return out;
  } catch (e) {
    console.error('decide', e);
    return { ...FALLBACK, motivo: `El bot falló al responder (${e instanceof Anthropic.APIError ? `API ${e.status}` : e.message})` };
  }
}
