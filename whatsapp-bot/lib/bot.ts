// Orquesta todo: recibe mensajes, atiende cada conversación y procesa tus comandos.
import type Anthropic from "@anthropic-ai/sdk";
import { responder, type DatosProspecto } from "./agente.js";
import type { Config } from "./config.js";
import type { Pendiente, Store } from "./store.js";
import { extraerMensajes, type ClienteWhatsApp, type MensajeEntrante } from "./whatsapp.js";

export interface Dependencias {
  config: Config;
  store: Store;
  wa: ClienteWhatsApp;
  claude: Anthropic;
}

/** Si una conversación supera estos mensajes, se empieza una nueva para no crecer sin límite. */
const MAX_MENSAJES_HISTORIAL = 300;
const SEGUNDOS_CANDADO = 240;

const ETIQUETA_PROYECTO: Record<DatosProspecto["tipo_proyecto"], string> = {
  landing_page: "Landing page",
  pagina_web: "Página web",
  sistema: "Sistema",
  otro: "Otro",
};

export function soloDigitos(texto: string): string {
  return texto.replace(/\D/g, "");
}

/** Compara números tolerando diferencias de prefijo (ej. 521... vs 52... en México). */
export function mismoNumero(a: string, b: string): boolean {
  if (a === b) return true;
  return a.length >= 10 && b.length >= 10 && a.slice(-10) === b.slice(-10);
}

/** Te avisa por WhatsApp. Usa la plantilla aprobada si existe (funciona fuera de la ventana de 24 h). */
export async function avisarDueno(deps: Dependencias, texto: string): Promise<void> {
  const { config, wa } = deps;
  if (config.ownerAlertTemplate) {
    try {
      // Meta no permite saltos de línea en los parámetros de una plantilla.
      const plano = texto.replace(/\s+/g, " ").trim();
      await wa.enviarPlantilla(config.ownerNumber, config.ownerAlertTemplate, config.ownerAlertTemplateLang, [plano]);
      return;
    } catch (error) {
      console.error("No se pudo enviar la plantilla de aviso, intento con texto:", error);
    }
  }
  try {
    await wa.enviarTexto(config.ownerNumber, texto);
  } catch (error) {
    console.error("No se pudo avisar al dueño:", error);
  }
}

export async function procesarWebhook(payload: unknown, deps: Dependencias): Promise<void> {
  const mensajes = extraerMensajes(payload);
  const conversaciones = new Set<string>();

  for (const m of mensajes) {
    if (!(await deps.store.reclamarMensaje(m.id))) continue; // duplicado
    deps.wa.marcarLeido(m.id).catch((e) => console.warn("marcarLeido falló:", e));

    if (mismoNumero(m.de, deps.config.ownerNumber) && m.texto.trim().startsWith("/")) {
      await ejecutarComando(m, deps);
      continue;
    }
    if (m.nombre) await deps.store.guardarNombre(m.de, m.nombre);
    await deps.store.agregarPendiente(m.de, { texto: m.texto, nombre: m.nombre });
    conversaciones.add(m.de);
  }

  await Promise.all([...conversaciones].map((numero) => atenderConversacion(numero, deps)));
}

/**
 * Atiende una conversación con un candado: si llegan varios mensajes seguidos,
 * se juntan en un solo turno en vez de responder cada uno por separado.
 */
export async function atenderConversacion(numero: string, deps: Dependencias): Promise<void> {
  const { store } = deps;
  for (;;) {
    const token = await store.tomarCandado(numero, SEGUNDOS_CANDADO);
    if (!token) return; // otro proceso ya atiende esta conversación y verá los pendientes
    try {
      for (;;) {
        const pendientes = await store.tomarPendientes(numero);
        if (pendientes.length === 0) break;
        await atenderTurno(numero, pendientes, deps);
      }
    } finally {
      await store.soltarCandado(numero, token);
    }
    // Un mensaje pudo llegar justo entre revisar pendientes y soltar el candado.
    if (!(await store.hayPendientes(numero))) return;
  }
}

async function atenderTurno(numero: string, pendientes: Pendiente[], deps: Dependencias): Promise<void> {
  const { store, wa, claude, config } = deps;
  let historial = await store.leerHistorial(numero);
  if (historial.length > MAX_MENSAJES_HISTORIAL) historial = [];

  const texto = pendientes.map((p) => p.texto).join("\n");
  historial.push({ role: "user", content: texto });

  if (await store.estaPausado(numero)) {
    // Tú estás atendiendo esta conversación: se guarda el mensaje para contexto, sin responder.
    await store.guardarHistorial(numero, historial);
    return;
  }

  const nombre = (await store.leerNombre(numero)) ?? pendientes.find((p) => p.nombre)?.nombre ?? "Sin nombre";

  try {
    const resultado = await responder({
      claude,
      modelo: config.claudeModel,
      historial,
      acciones: {
        async registrarProspecto(datos) {
          await store.guardarProspecto({
            numero,
            nombre: datos.nombre || nombre,
            tipoProyecto: datos.tipo_proyecto,
            descripcion: datos.descripcion,
            plazoOPresupuesto: datos.plazo_o_presupuesto,
            aceptaAnticipo: datos.acepta_anticipo_50,
            fecha: new Date().toISOString(),
          });
          await avisarDueno(
            deps,
            `🔥 Prospecto calificado: ${datos.nombre || nombre} (+${numero}). ` +
              `${ETIQUETA_PROYECTO[datos.tipo_proyecto]}: ${datos.descripcion}. ` +
              `Plazo/presupuesto: ${datos.plazo_o_presupuesto}. Acepta 50% de anticipo. ` +
              `Envíale la cotización: https://wa.me/${numero}`,
          );
        },
        async pasarAHumano(motivo) {
          await store.pausar(numero, true);
          await avisarDueno(
            deps,
            `🙋 ${nombre} (+${numero}) necesita atención personal: ${motivo}. ` +
              `El asistente quedó en pausa con esta persona. Responde con /responder ${numero} tu mensaje, ` +
              `y cuando termines escribe /activar ${numero}.`,
          );
        },
      },
    });

    await store.guardarHistorial(numero, resultado.historial);
    if (resultado.texto) await wa.enviarTexto(numero, resultado.texto);

    if (resultado.rechazado) {
      await store.pausar(numero, true);
      await wa.enviarTexto(numero, "Gracias por tu mensaje. En breve una persona del equipo te responde. 🙌");
      await avisarDueno(
        deps,
        `⚠️ El asistente no pudo responder a ${nombre} (+${numero}) y quedó en pausa. Revisa la conversación: https://wa.me/${numero}`,
      );
    }
  } catch (error) {
    console.error(`Error atendiendo a ${numero}:`, error);
    // Se guarda el mensaje para no perderlo; el siguiente mensaje de la persona retoma la conversación.
    await store.guardarHistorial(numero, historial);
    await wa
      .enviarTexto(numero, "Gracias por escribirnos. En un momento te respondemos. 🙌")
      .catch((e) => console.error("Tampoco se pudo enviar el mensaje de respaldo:", e));
    await avisarDueno(deps, `⚠️ Falló el asistente al responder a ${nombre} (+${numero}). Escríbele: https://wa.me/${numero}`);
  }
}

const AYUDA = `Comandos (envíalos desde tu número al número del bot):
/prospectos — últimos prospectos calificados
/responder NUMERO texto — le escribes tú a la persona (el bot se pausa con ella)
/pausar NUMERO — el bot deja de responderle
/activar NUMERO — el bot vuelve a responderle
/reiniciar NUMERO — borra el historial con esa persona
/ayuda — esta lista`;

async function ejecutarComando(m: MensajeEntrante, deps: Dependencias): Promise<void> {
  const { store, wa } = deps;
  const [comando = "", argumento = ""] = m.texto.trim().split(/\s+/);
  const numero = soloDigitos(argumento);
  const contestar = (texto: string) => wa.enviarTexto(m.de, texto);
  const requiereNumero = async () => {
    if (numero.length < 8) {
      await contestar(`Falta el número. Ejemplo: ${comando.toLowerCase()} 5215512345678`);
      return false;
    }
    return true;
  };

  switch (comando.toLowerCase()) {
    case "/prospectos": {
      const lista = await store.listarProspectos(10);
      if (lista.length === 0) return contestar("Todavía no hay prospectos calificados.");
      return contestar(
        lista
          .map(
            (p, i) =>
              `${i + 1}. ${p.nombre} — ${ETIQUETA_PROYECTO[p.tipoProyecto as DatosProspecto["tipo_proyecto"]] ?? p.tipoProyecto}\n` +
              `${p.descripcion}\nPlazo/presupuesto: ${p.plazoOPresupuesto}\nhttps://wa.me/${p.numero}`,
          )
          .join("\n\n"),
      );
    }
    case "/responder": {
      if (!(await requiereNumero())) return;
      // Conserva los saltos de línea del mensaje que escribiste.
      const texto = m.texto.trim().match(/^\S+\s+\S+\s+([\s\S]+)$/)?.[1]?.trim() ?? "";
      if (!texto) return contestar("Falta el mensaje. Ejemplo: /responder 5215512345678 Hola, te comparto la cotización…");
      try {
        await wa.enviarTexto(numero, texto);
      } catch (error) {
        console.error(error);
        return contestar(
          "No se pudo enviar. Si la persona no ha escrito en las últimas 24 h, WhatsApp no permite mensajes libres; escríbele desde el administrador de Meta con una plantilla.",
        );
      }
      await store.pausar(numero, true);
      const historial = await store.leerHistorial(numero);
      historial.push({ role: "assistant", content: texto });
      await store.guardarHistorial(numero, historial);
      return contestar(`Enviado ✅. El bot quedó en pausa con +${numero}. Usa /activar ${numero} para devolvérselo.`);
    }
    case "/pausar":
      if (!(await requiereNumero())) return;
      await store.pausar(numero, true);
      return contestar(`⏸️ Bot en pausa con +${numero}.`);
    case "/activar":
      if (!(await requiereNumero())) return;
      await store.pausar(numero, false);
      return contestar(`▶️ Bot activo otra vez con +${numero}.`);
    case "/reiniciar":
      if (!(await requiereNumero())) return;
      await store.borrarHistorial(numero);
      await store.pausar(numero, false);
      return contestar(`🔄 Historial borrado con +${numero}.`);
    default:
      return contestar(AYUDA);
  }
}
