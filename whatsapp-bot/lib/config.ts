// Lee la configuración desde variables de entorno (Vercel → Settings → Environment Variables).

function requerida(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre}`);
  return valor;
}

function opcional(nombre: string, porDefecto = ""): string {
  return process.env[nombre] || porDefecto;
}

export interface Config {
  whatsappToken: string;
  whatsappPhoneNumberId: string;
  whatsappAppSecret: string;
  whatsappVerifyToken: string;
  graphApiVersion: string;
  /** Tu número personal, en formato internacional sin "+" (ej. 5215512345678). */
  ownerNumber: string;
  /** Plantilla aprobada por Meta para avisarte fuera de la ventana de 24 h (opcional). */
  ownerAlertTemplate: string;
  ownerAlertTemplateLang: string;
  claudeModel: string;
}

export function cargarConfig(): Config {
  return {
    whatsappToken: requerida("WHATSAPP_TOKEN"),
    whatsappPhoneNumberId: requerida("WHATSAPP_PHONE_NUMBER_ID"),
    whatsappAppSecret: requerida("WHATSAPP_APP_SECRET"),
    whatsappVerifyToken: requerida("WHATSAPP_VERIFY_TOKEN"),
    graphApiVersion: opcional("WHATSAPP_GRAPH_VERSION", "v23.0"),
    ownerNumber: requerida("OWNER_WHATSAPP").replace(/\D/g, ""),
    ownerAlertTemplate: opcional("OWNER_ALERT_TEMPLATE"),
    ownerAlertTemplateLang: opcional("OWNER_ALERT_TEMPLATE_LANG", "es_MX"),
    claudeModel: opcional("CLAUDE_MODEL", "claude-opus-5-5"),
  };
}
