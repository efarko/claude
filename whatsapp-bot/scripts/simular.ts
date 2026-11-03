// Prueba el asistente en tu computadora, sin WhatsApp: escribes como si fueras un prospecto.
// Uso:  ANTHROPIC_API_KEY=sk-ant-... npm run simular
import Anthropic from "@anthropic-ai/sdk";
import { createInterface } from "node:readline/promises";
import { procesarWebhook, type Dependencias } from "../lib/bot.js";
import { MemoriaStore } from "../lib/store.js";

const PROSPECTO = "5215511112222";
const DUENO = "5215500000000";

const deps: Dependencias = {
  config: {
    whatsappToken: "",
    whatsappPhoneNumberId: "",
    whatsappAppSecret: "",
    whatsappVerifyToken: "",
    graphApiVersion: "v23.0",
    ownerNumber: DUENO,
    ownerAlertTemplate: "",
    ownerAlertTemplateLang: "es_MX",
    claudeModel: process.env.CLAUDE_MODEL || "claude-opus-5-5",
  },
  store: new MemoriaStore(),
  claude: new Anthropic(),
  wa: {
    async enviarTexto(para, texto) {
      const quien = para === DUENO ? "\x1b[33m[aviso para ti]\x1b[0m" : "\x1b[32mBot:\x1b[0m";
      console.log(`${quien} ${texto}\n`);
    },
    async enviarPlantilla(_para, _plantilla, _idioma, parametros) {
      console.log(`\x1b[33m[aviso para ti]\x1b[0m ${parametros.join(" ")}\n`);
    },
    async marcarLeido() {},
  },
};

const rl = createInterface({ input: process.stdin, output: process.stdout });
console.log("Escribe como si fueras un prospecto. Empieza con /dueno para mandar un comando como dueño. Ctrl+C para salir.\n");
let n = 0;
for (;;) {
  const linea = (await rl.question("\x1b[36mTú:\x1b[0m ")).trim();
  if (!linea) continue;
  const comoDueno = linea.startsWith("/dueno ");
  const de = comoDueno ? DUENO : PROSPECTO;
  const texto = comoDueno ? linea.slice("/dueno ".length) : linea;
  await procesarWebhook(
    {
      entry: [
        {
          changes: [
            {
              value: {
                contacts: [{ wa_id: de, profile: { name: "Prospecto de prueba" } }],
                messages: [{ id: `sim.${++n}`, from: de, type: "text", text: { body: texto } }],
              },
            },
          ],
        },
      ],
    },
    deps,
  );
}
