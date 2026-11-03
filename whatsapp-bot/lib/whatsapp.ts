// Comunicación con la API oficial de WhatsApp (WhatsApp Business Platform / Cloud API de Meta).
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Config } from "./config.js";

/** Límite de caracteres de un mensaje de texto de WhatsApp. */
const LIMITE_TEXTO = 4096;

/** Verifica la firma X-Hub-Signature-256 que Meta agrega a cada webhook. */
export function firmaValida(cuerpo: string, firma: string | null, appSecret: string): boolean {
  if (!firma?.startsWith("sha256=")) return false;
  const esperada = createHmac("sha256", appSecret).update(cuerpo, "utf8").digest("hex");
  const recibida = firma.slice("sha256=".length);
  const a = Buffer.from(esperada, "hex");
  const b = Buffer.from(recibida, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export interface MensajeEntrante {
  id: string;
  /** Número del remitente (wa_id), sin "+". */
  de: string;
  nombre?: string;
  /** Texto del mensaje, o una descripción si no es texto (audio, imagen...). */
  texto: string;
}

const DESCRIPCION_TIPO: Record<string, string> = {
  audio: "[La persona envió un audio]",
  voice: "[La persona envió una nota de voz]",
  image: "[La persona envió una imagen]",
  video: "[La persona envió un video]",
  document: "[La persona envió un documento]",
  sticker: "[La persona envió un sticker]",
  location: "[La persona envió una ubicación]",
  contacts: "[La persona envió un contacto]",
};

/** Extrae los mensajes entrantes del cuerpo de un webhook (ignora confirmaciones de entrega/lectura). */
export function extraerMensajes(payload: unknown): MensajeEntrante[] {
  const resultado: MensajeEntrante[] = [];
  const entradas = (payload as { entry?: unknown[] })?.entry ?? [];
  for (const entrada of entradas as { changes?: unknown[] }[]) {
    for (const cambio of (entrada.changes ?? []) as { value?: any }[]) {
      const valor = cambio.value;
      if (!valor?.messages) continue;
      const nombres = new Map<string, string>();
      for (const c of valor.contacts ?? []) {
        if (c?.wa_id && c?.profile?.name) nombres.set(c.wa_id, c.profile.name);
      }
      for (const m of valor.messages) {
        if (!m?.id || !m?.from) continue;
        let texto: string | undefined;
        if (m.type === "text") texto = m.text?.body;
        else if (m.type === "button") texto = m.button?.text;
        else if (m.type === "interactive") {
          texto = m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title;
        } else if (m.image?.caption || m.video?.caption || m.document?.caption) {
          texto = `${DESCRIPCION_TIPO[m.type]} con el texto: ${m.image?.caption ?? m.video?.caption ?? m.document?.caption}`;
        } else texto = DESCRIPCION_TIPO[m.type] ?? `[La persona envió un mensaje de tipo ${m.type}]`;
        if (!texto) continue;
        resultado.push({ id: m.id, de: m.from, nombre: nombres.get(m.from), texto });
      }
    }
  }
  return resultado;
}

/** Divide un texto largo en partes que quepan en un mensaje de WhatsApp. */
export function dividirTexto(texto: string, limite = LIMITE_TEXTO): string[] {
  const partes: string[] = [];
  let resto = texto.trim();
  while (resto.length > limite) {
    let corte = resto.lastIndexOf("\n", limite);
    if (corte < limite / 2) corte = resto.lastIndexOf(" ", limite);
    if (corte < limite / 2) corte = limite;
    partes.push(resto.slice(0, corte).trim());
    resto = resto.slice(corte).trim();
  }
  if (resto) partes.push(resto);
  return partes;
}

export interface ClienteWhatsApp {
  enviarTexto(para: string, texto: string): Promise<void>;
  enviarPlantilla(para: string, plantilla: string, idioma: string, parametros: string[]): Promise<void>;
  marcarLeido(idMensaje: string): Promise<void>;
}

export class ErrorWhatsApp extends Error {
  constructor(
    readonly status: number,
    readonly detalle: string,
  ) {
    super(`WhatsApp API ${status}: ${detalle}`);
  }
}

export function crearClienteWhatsApp(config: Config): ClienteWhatsApp {
  const url = `https://graph.facebook.com/${config.graphApiVersion}/${config.whatsappPhoneNumberId}/messages`;

  async function llamar(cuerpo: Record<string, unknown>): Promise<void> {
    const respuesta = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.whatsappToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messaging_product: "whatsapp", ...cuerpo }),
    });
    if (!respuesta.ok) throw new ErrorWhatsApp(respuesta.status, await respuesta.text());
  }

  return {
    async enviarTexto(para, texto) {
      for (const parte of dividirTexto(texto)) {
        await llamar({ to: para, type: "text", text: { body: parte, preview_url: true } });
      }
    },
    async enviarPlantilla(para, plantilla, idioma, parametros) {
      await llamar({
        to: para,
        type: "template",
        template: {
          name: plantilla,
          language: { code: idioma },
          components: [
            {
              type: "body",
              parameters: parametros.map((p) => ({ type: "text", text: p.slice(0, 1000) })),
            },
          ],
        },
      });
    },
    async marcarLeido(idMensaje) {
      // Marca como leído y muestra "escribiendo..." mientras se genera la respuesta.
      await llamar({ status: "read", message_id: idMensaje, typing_indicator: { type: "text" } });
    },
  };
}
