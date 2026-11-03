import { createHmac } from "node:crypto";
import type Anthropic from "@anthropic-ai/sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mismoNumero, procesarWebhook, type Dependencias } from "../lib/bot.js";
import type { Config } from "../lib/config.js";
import { MemoriaStore } from "../lib/store.js";
import { dividirTexto, extraerMensajes, firmaValida, type ClienteWhatsApp } from "../lib/whatsapp.js";

const DUENO = "5215500000000";
const PROSPECTO = "5215511112222";

const config: Config = {
  whatsappToken: "t",
  whatsappPhoneNumberId: "123",
  whatsappAppSecret: "secreto",
  whatsappVerifyToken: "v",
  graphApiVersion: "v23.0",
  ownerNumber: DUENO,
  ownerAlertTemplate: "",
  ownerAlertTemplateLang: "es_MX",
  claudeModel: "claude-opus-5-5",
};

let contador = 0;
function webhook(de: string, texto: string, nombre = "Ana") {
  return {
    entry: [
      {
        changes: [
          {
            value: {
              contacts: [{ wa_id: de, profile: { name: nombre } }],
              messages: [{ id: `wamid.${++contador}`, from: de, type: "text", text: { body: texto } }],
            },
          },
        ],
      },
    ],
  };
}

function respuestaTexto(texto: string) {
  return { stop_reason: "end_turn", content: [{ type: "text", text: texto }] };
}

function respuestaHerramienta(name: string, input: unknown, texto = "") {
  return {
    stop_reason: "tool_use",
    content: [...(texto ? [{ type: "text", text: texto }] : []), { type: "tool_use", id: `tu_${++contador}`, name, input }],
  };
}

let enviados: { para: string; texto: string }[];
let store: MemoriaStore;
let crear: ReturnType<typeof vi.fn>;
let deps: Dependencias;

beforeEach(() => {
  enviados = [];
  store = new MemoriaStore();
  crear = vi.fn();
  const wa: ClienteWhatsApp = {
    enviarTexto: async (para, texto) => void enviados.push({ para, texto }),
    enviarPlantilla: async () => {},
    marcarLeido: async () => {},
  };
  deps = { config, store, wa, claude: { beta: { messages: { create: crear } } } as unknown as Anthropic };
});

describe("whatsapp", () => {
  it("valida la firma de Meta", () => {
    const cuerpo = '{"hola":1}';
    const firma = "sha256=" + createHmac("sha256", "secreto").update(cuerpo).digest("hex");
    expect(firmaValida(cuerpo, firma, "secreto")).toBe(true);
    expect(firmaValida(cuerpo, firma, "otro")).toBe(false);
    expect(firmaValida(cuerpo, null, "secreto")).toBe(false);
    expect(firmaValida(cuerpo, "sha256=abc", "secreto")).toBe(false);
  });

  it("extrae texto, describe audios e ignora estados", () => {
    const payload = {
      entry: [
        {
          changes: [
            { value: { statuses: [{ id: "x", status: "read" }] } },
            {
              value: {
                contacts: [{ wa_id: "1", profile: { name: "Luis" } }],
                messages: [
                  { id: "a", from: "1", type: "text", text: { body: "Hola" } },
                  { id: "b", from: "1", type: "audio", audio: { id: "m" } },
                ],
              },
            },
          ],
        },
      ],
    };
    expect(extraerMensajes(payload)).toEqual([
      { id: "a", de: "1", nombre: "Luis", texto: "Hola" },
      { id: "b", de: "1", nombre: "Luis", texto: "[La persona envió un audio]" },
    ]);
  });

  it("divide textos largos", () => {
    const partes = dividirTexto("palabra ".repeat(1000), 100);
    expect(partes.every((p) => p.length <= 100)).toBe(true);
    expect(partes.join(" ")).toBe("palabra ".repeat(1000).trim());
  });

  it("compara números con prefijos distintos", () => {
    expect(mismoNumero("5215512345678", "525512345678")).toBe(true);
    expect(mismoNumero("5215512345678", "5215599999999")).toBe(false);
  });
});

describe("bot", () => {
  it("responde a un prospecto y guarda el historial", async () => {
    crear.mockResolvedValueOnce(respuestaTexto("¡Hola Ana! Soy el asistente virtual. ¿Qué necesitas?"));
    await procesarWebhook(webhook(PROSPECTO, "Hola, quiero una página"), deps);

    expect(enviados).toEqual([{ para: PROSPECTO, texto: "¡Hola Ana! Soy el asistente virtual. ¿Qué necesitas?" }]);
    const params = crear.mock.calls[0]![0];
    expect(params.model).toBe("claude-opus-5-5");
    expect(params.fallbacks).toBe("default");
    expect(params.messages).toEqual([{ role: "user", content: "Hola, quiero una página" }]);
    expect(await store.leerHistorial(PROSPECTO)).toHaveLength(2);
  });

  it("ignora mensajes duplicados", async () => {
    crear.mockResolvedValue(respuestaTexto("Hola"));
    const w = webhook(PROSPECTO, "Hola");
    await procesarWebhook(w, deps);
    await procesarWebhook(w, deps);
    expect(crear).toHaveBeenCalledTimes(1);
  });

  it("registra un prospecto calificado y avisa al dueño", async () => {
    crear
      .mockResolvedValueOnce(
        respuestaHerramienta("registrar_prospecto_calificado", {
          nombre: "Ana",
          tipo_proyecto: "landing_page",
          descripcion: "Pastelería que quiere vender por internet",
          plazo_o_presupuesto: "En 2 semanas",
          acepta_anticipo_50: true,
        }),
      )
      .mockResolvedValueOnce(respuestaTexto("¡Perfecto! En breve te llega la cotización."));
    await procesarWebhook(webhook(PROSPECTO, "Sí, me funciona el 50%"), deps);

    const prospectos = await store.listarProspectos(10);
    expect(prospectos).toHaveLength(1);
    expect(prospectos[0]).toMatchObject({ numero: PROSPECTO, tipoProyecto: "landing_page" });
    expect(enviados.find((e) => e.para === DUENO)?.texto).toContain("Prospecto calificado");
    expect(enviados.at(-1)).toEqual({ para: PROSPECTO, texto: "¡Perfecto! En breve te llega la cotización." });

    // El historial queda: usuario, asistente (tool_use), usuario (tool_result), asistente (texto).
    const historial = await store.leerHistorial(PROSPECTO);
    expect(historial.map((m) => m.role)).toEqual(["user", "assistant", "user", "assistant"]);
  });

  it("no registra si no acepta el anticipo", async () => {
    crear
      .mockResolvedValueOnce(
        respuestaHerramienta("registrar_prospecto_calificado", {
          nombre: "Ana",
          tipo_proyecto: "sistema",
          descripcion: "x",
          plazo_o_presupuesto: "x",
          acepta_anticipo_50: false,
        }),
      )
      .mockResolvedValueOnce(respuestaTexto("Entiendo"));
    await procesarWebhook(webhook(PROSPECTO, "No sé"), deps);
    expect(await store.listarProspectos(10)).toHaveLength(0);
  });

  it("pasa a humano, se pausa y deja de responder", async () => {
    crear
      .mockResolvedValueOnce(respuestaHerramienta("pasar_a_humano", { motivo: "Pide descuento" }, "Te comunico con el equipo."))
      .mockResolvedValueOnce(respuestaTexto(""));
    await procesarWebhook(webhook(PROSPECTO, "¿Me haces descuento?"), deps);

    expect(await store.estaPausado(PROSPECTO)).toBe(true);
    expect(enviados.find((e) => e.para === DUENO)?.texto).toContain("Pide descuento");
    expect(enviados.at(-1)).toEqual({ para: PROSPECTO, texto: "Te comunico con el equipo." });

    await procesarWebhook(webhook(PROSPECTO, "¿Hola?"), deps);
    expect(crear).toHaveBeenCalledTimes(2); // ya no llama a Claude
    expect((await store.leerHistorial(PROSPECTO)).at(-1)).toEqual({ role: "user", content: "¿Hola?" });
  });

  it("si Claude declina, pausa y avisa", async () => {
    crear.mockResolvedValueOnce({ stop_reason: "refusal", content: [] });
    await procesarWebhook(webhook(PROSPECTO, "algo"), deps);
    expect(await store.estaPausado(PROSPECTO)).toBe(true);
    expect(enviados.some((e) => e.para === DUENO)).toBe(true);
    expect(enviados.some((e) => e.para === PROSPECTO)).toBe(true);
  });

  it("si la API falla, manda un mensaje de respaldo y conserva el mensaje", async () => {
    crear.mockRejectedValueOnce(new Error("caída"));
    await procesarWebhook(webhook(PROSPECTO, "Hola"), deps);
    expect(enviados.some((e) => e.para === PROSPECTO)).toBe(true);
    expect(enviados.some((e) => e.para === DUENO && e.texto.includes("Falló"))).toBe(true);
    expect(await store.leerHistorial(PROSPECTO)).toEqual([{ role: "user", content: "Hola" }]);
  });

  it("junta mensajes que llegan mientras se responde", async () => {
    let soltar!: () => void;
    crear
      .mockImplementationOnce(() => new Promise((r) => (soltar = () => r(respuestaTexto("Primera")))))
      .mockResolvedValueOnce(respuestaTexto("Segunda"));
    const primero = procesarWebhook(webhook(PROSPECTO, "Hola"), deps);
    await vi.waitFor(() => expect(crear).toHaveBeenCalledTimes(1));
    await procesarWebhook(webhook(PROSPECTO, "quiero"), deps);
    await procesarWebhook(webhook(PROSPECTO, "una web"), deps);
    soltar();
    await primero;

    expect(crear).toHaveBeenCalledTimes(2);
    expect(crear.mock.calls[1]![0].messages.at(-1)).toEqual({ role: "user", content: "quiero\nuna web" });
  });
});

describe("comandos del dueño", () => {
  it("/responder envía, pausa y guarda en el historial", async () => {
    await procesarWebhook(webhook(DUENO, `/responder ${PROSPECTO} Hola Ana,\nte mando la cotización`), deps);
    expect(enviados[0]).toEqual({ para: PROSPECTO, texto: "Hola Ana,\nte mando la cotización" });
    expect(await store.estaPausado(PROSPECTO)).toBe(true);
    expect(crear).not.toHaveBeenCalled();
  });

  it("/activar reactiva y /prospectos lista", async () => {
    await store.pausar(PROSPECTO, true);
    await procesarWebhook(webhook(DUENO, `/activar ${PROSPECTO}`), deps);
    expect(await store.estaPausado(PROSPECTO)).toBe(false);

    await procesarWebhook(webhook(DUENO, "/prospectos"), deps);
    expect(enviados.at(-1)?.texto).toContain("Todavía no hay");
  });

  it("los mensajes del dueño sin / se atienden como prospecto (para probar)", async () => {
    crear.mockResolvedValueOnce(respuestaTexto("Hola"));
    await procesarWebhook(webhook(DUENO, "Hola, soy una prueba"), deps);
    expect(crear).toHaveBeenCalledTimes(1);
  });
});
