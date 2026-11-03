// Endpoint que Meta llama cada vez que llega un mensaje: https://TU-PROYECTO.vercel.app/api/webhook
import Anthropic from "@anthropic-ai/sdk";
import { waitUntil } from "@vercel/functions";
import { procesarWebhook, type Dependencias } from "../lib/bot.js";
import { cargarConfig } from "../lib/config.js";
import { crearStore } from "../lib/store.js";
import { crearClienteWhatsApp, firmaValida } from "../lib/whatsapp.js";

let deps: Dependencias | undefined;
function dependencias(): Dependencias {
  if (!deps) {
    const config = cargarConfig();
    deps = { config, store: crearStore(), wa: crearClienteWhatsApp(config), claude: new Anthropic() };
  }
  return deps;
}

/** Verificación inicial del webhook (Meta → Configuración de WhatsApp → Webhook → Verificar). */
export function GET(request: Request): Response {
  const url = new URL(request.url);
  const { config } = dependencias();
  if (
    url.searchParams.get("hub.mode") === "subscribe" &&
    url.searchParams.get("hub.verify_token") === config.whatsappVerifyToken
  ) {
    return new Response(url.searchParams.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Token de verificación incorrecto", { status: 403 });
}

/** Mensajes entrantes. Se responde 200 de inmediato y la respuesta se genera en segundo plano. */
export async function POST(request: Request): Promise<Response> {
  const d = dependencias();
  const cuerpo = await request.text();
  if (!firmaValida(cuerpo, request.headers.get("x-hub-signature-256"), d.config.whatsappAppSecret)) {
    return new Response("Firma inválida", { status: 401 });
  }
  let payload: unknown;
  try {
    payload = JSON.parse(cuerpo);
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }
  waitUntil(procesarWebhook(payload, d).catch((e) => console.error("Error procesando webhook:", e)));
  return new Response("OK", { status: 200 });
}
