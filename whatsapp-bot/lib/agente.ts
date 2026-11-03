// El "cerebro": manda la conversación a Claude y ejecuta las herramientas que pida.
import Anthropic from "@anthropic-ai/sdk";
import { promptDeSistema } from "./negocio.js";
import type { Historial } from "./store.js";

export const TIPOS_PROYECTO = ["landing_page", "pagina_web", "sistema", "otro"] as const;

export interface DatosProspecto {
  nombre: string;
  tipo_proyecto: (typeof TIPOS_PROYECTO)[number];
  descripcion: string;
  plazo_o_presupuesto: string;
  acepta_anticipo_50: boolean;
}

export interface Acciones {
  registrarProspecto(datos: DatosProspecto): Promise<void>;
  pasarAHumano(motivo: string): Promise<void>;
}

const HERRAMIENTAS: Anthropic.Beta.BetaToolUnion[] = [
  {
    name: "registrar_prospecto_calificado",
    description:
      "Registra a la persona como prospecto calificado y avisa al dueño para que le envíe la cotización. Úsala solo cuando ya sabes qué necesita y aceptó pagar el 50% de anticipo para empezar.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        nombre: { type: "string", description: "Nombre de la persona (o 'desconocido')." },
        tipo_proyecto: { type: "string", enum: [...TIPOS_PROYECTO] },
        descripcion: {
          type: "string",
          description: "Resumen breve: a qué se dedica su negocio y qué quiere lograr con el proyecto.",
        },
        plazo_o_presupuesto: {
          type: "string",
          description: "Para cuándo lo necesita y presupuesto aproximado, si lo dijo ('no indicó' si no).",
        },
        acepta_anticipo_50: { type: "boolean" },
      },
      required: ["nombre", "tipo_proyecto", "descripcion", "plazo_o_presupuesto", "acepta_anticipo_50"],
      additionalProperties: false,
    },
  },
  {
    name: "pasar_a_humano",
    description:
      "Pausa al asistente en esta conversación y avisa al dueño para que continúe en persona. Úsala cuando la persona lo pida, cuando pregunte algo que no está en tu información, quiera negociar o esté molesta.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        motivo: { type: "string", description: "Por qué se necesita a una persona, en una frase." },
      },
      required: ["motivo"],
      additionalProperties: false,
    },
  },
];

const MAX_VUELTAS = 6;

export interface Resultado {
  /** Texto a enviar a la persona (puede estar vacío). */
  texto: string;
  historial: Historial;
  /** true si Claude declinó responder (stop_reason "refusal"). */
  rechazado: boolean;
}

function esDatosProspecto(x: unknown): x is DatosProspecto {
  const d = x as DatosProspecto;
  return (
    typeof d?.nombre === "string" &&
    typeof d.descripcion === "string" &&
    typeof d.plazo_o_presupuesto === "string" &&
    typeof d.acepta_anticipo_50 === "boolean" &&
    (TIPOS_PROYECTO as readonly string[]).includes(d.tipo_proyecto)
  );
}

async function ejecutarHerramienta(bloque: Anthropic.Beta.BetaToolUseBlock, acciones: Acciones): Promise<string> {
  const entrada = bloque.input as Record<string, unknown>;
  switch (bloque.name) {
    case "registrar_prospecto_calificado":
      if (!esDatosProspecto(entrada)) throw new Error("Datos del prospecto incompletos.");
      if (!entrada.acepta_anticipo_50) {
        return "No registrado: la persona aún no acepta el 50% de anticipo. Sigue la conversación.";
      }
      await acciones.registrarProspecto(entrada);
      return "Prospecto registrado y dueño avisado. Dile que pronto recibirá la cotización y los datos de pago.";
    case "pasar_a_humano":
      if (typeof entrada.motivo !== "string") throw new Error("Falta el motivo.");
      await acciones.pasarAHumano(entrada.motivo);
      return "Dueño avisado y asistente pausado en esta conversación. Despídete brevemente si no lo has hecho.";
    default:
      throw new Error(`Herramienta desconocida: ${bloque.name}`);
  }
}

/**
 * Agrega el mensaje de la persona y obtiene la respuesta de Claude.
 * El historial solo crece al final (nunca se editan turnos anteriores), como
 * requiere la API para conservar el razonamiento de turnos previos.
 */
export async function responder(opciones: {
  claude: Anthropic;
  modelo: string;
  historial: Historial;
  acciones: Acciones;
}): Promise<Resultado> {
  const { claude, modelo, acciones } = opciones;
  const historial = [...opciones.historial];
  const textos: string[] = [];
  const sistema = promptDeSistema();

  for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta++) {
    const ultima = vuelta === MAX_VUELTAS - 1;
    const respuesta = await claude.beta.messages.create({
      model: modelo,
      max_tokens: 16000,
      // Chat de ventas: esfuerzo bajo = respuestas rápidas y económicas.
      output_config: { effort: "low" },
      system: sistema,
      cache_control: { type: "ephemeral" },
      tools: HERRAMIENTAS,
      tool_choice: ultima ? { type: "none" } : { type: "auto" },
      // Si un filtro de seguridad declina por error, la API reintenta con otro modelo.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages: [...historial],
    });

    if (respuesta.stop_reason === "refusal") {
      return { texto: textos.join("\n\n"), historial, rechazado: true };
    }

    historial.push({ role: "assistant", content: respuesta.content });
    for (const b of respuesta.content) {
      if (b.type === "text" && b.text.trim()) textos.push(b.text.trim());
    }

    if (respuesta.stop_reason !== "tool_use") break;

    const resultados: Anthropic.Beta.BetaToolResultBlockParam[] = [];
    for (const b of respuesta.content) {
      if (b.type !== "tool_use") continue;
      try {
        resultados.push({ type: "tool_result", tool_use_id: b.id, content: await ejecutarHerramienta(b, acciones) });
      } catch (error) {
        resultados.push({
          type: "tool_result",
          tool_use_id: b.id,
          is_error: true,
          content: error instanceof Error ? error.message : String(error),
        });
      }
    }
    historial.push({ role: "user", content: resultados });
  }

  return { texto: textos.join("\n\n"), historial, rechazado: false };
}
