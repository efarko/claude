# Asistente de ventas por WhatsApp

Un bot que contesta por ti en WhatsApp las 24 horas. Atiende a quien escribe a tu número de negocio, entiende qué necesita (landing page, página web o sistema) y le pregunta si acepta pagar el **50% de anticipo para empezar**. Cuando acepta, te avisa a tu WhatsApp personal con el resumen del proyecto para que le mandes la cotización.

## Qué hace

- Responde en segundos, en español y en tono de chat. Junta en una sola respuesta los mensajes que llegan seguidos.
- Hace las preguntas de una en una: nombre, giro del negocio, qué quiere lograr, plazo y presupuesto.
- **Prospecto calificado** (sabe qué necesita y acepta el 50% de anticipo): lo guarda y te avisa con 🔥.
- **Pasa la conversación a ti** cuando la persona pide hablar con alguien, quiere negociar o pregunta algo que el bot no sabe. Se pausa con esa persona y te avisa con 🙋.
- No inventa precios, descuentos ni datos de pago. Si le preguntan si es un bot, dice la verdad.
- Si algo falla, le manda a la persona un "en un momento te respondemos" y te avisa.

## Cómo funciona

```
Prospecto ──WhatsApp──► Meta (API oficial) ──webhook──► Vercel (/api/webhook)
                                                         │  ├─ Claude genera la respuesta
                                                         │  └─ Redis guarda las conversaciones
Prospecto ◄──WhatsApp── Meta ◄────────────────────────────┘
Tú (avisos y comandos) ◄──► el mismo número del bot
```

## Lo que necesitas (una sola vez)

| Qué | Dónde | Costo aproximado |
|---|---|---|
| Cuenta de Meta Business | business.facebook.com | Gratis |
| Un número de teléfono **que no tenga WhatsApp activo** (un chip nuevo sirve) | Cualquier compañía | El del chip |
| App de Meta con el producto WhatsApp | developers.facebook.com | Gratis. Con los precios actuales de Meta, responder a quien te escribe primero es gratis. |
| Cuenta en la API de Claude y una API key | console.anthropic.com | Pagas por uso. Una conversación de venta cuesta aproximadamente centavos de dólar. |
| Cuenta de Vercel | vercel.com | El plan gratuito alcanza para empezar |
| Redis (Upstash) | Desde el Marketplace de Vercel | El plan gratuito alcanza para empezar |

## Paso a paso

### 1. API key de Claude
1. Entra a **console.anthropic.com** y crea una cuenta.
2. En **Billing** agrega una forma de pago y algo de saldo. Te recomiendo poner un límite de gasto mensual.
3. En **API Keys** crea una clave y guárdala (empieza con `sk-ant-`). Solo se muestra una vez.

### 2. WhatsApp Business Platform (Meta)
1. Crea tu portafolio en **business.facebook.com** con el nombre de tu negocio.
2. Entra a **developers.facebook.com**, ve a **Mis apps**, **Crear app**, elige tipo **Empresa**, y en la app agrega el producto **WhatsApp**.
3. En **WhatsApp**, **Configuración de la API**, agrega tu número nuevo y verifícalo con el código SMS. Copia el **Identificador del número de teléfono** (Phone number ID).
4. Crea un **token permanente**: en business.facebook.com ve a **Configuración**, **Usuarios del sistema**, crea uno con rol Administrador, asígnale la app y genera un token con los permisos `whatsapp_business_messaging` y `whatsapp_business_management`.
5. En la app ve a **Configuración de la app**, **Básica** y copia la **Clave secreta de la app** (App secret).
6. Inventa una palabra secreta para el webhook, por ejemplo `mi-bot-2026-xyz`.

### 3. Publicar en Vercel
1. En vercel.com crea un proyecto nuevo desde este repositorio. En **Root Directory** elige `whatsapp-bot`.
2. En **Storage** (o **Marketplace**) agrega **Upstash Redis** y conéctalo al proyecto. Las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN` se crean solas.
3. En **Settings**, **Environment Variables**, agrega las variables de [`.env.example`](.env.example):
   - `ANTHROPIC_API_KEY`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`
   - `OWNER_WHATSAPP`: tu WhatsApp personal en formato internacional sin `+`, por ejemplo `5215512345678`.
   - `NOMBRE_NEGOCIO` y `NOMBRE_DUENO`: cómo se presenta el bot y a quién menciona.
4. Haz **Deploy** y copia la dirección del proyecto, por ejemplo `https://mi-bot.vercel.app`.

### 4. Conectar el webhook
1. En developers.facebook.com, en tu app, ve a **WhatsApp**, **Configuración**, **Webhook** y haz clic en **Editar**.
2. **URL de devolución de llamada**: `https://mi-bot.vercel.app/api/webhook`
3. **Token de verificación**: la palabra secreta del paso 2.6. Luego **Verificar y guardar**.
4. En **Campos del webhook**, suscríbete a **messages**.

### 5. Probar
Escribe desde otro teléfono al número del bot. Debe contestar en unos segundos.

## Personalizar lo que dice el bot

Edita [`lib/negocio.ts`](lib/negocio.ts):
- **Servicios**: descripción, precio y tiempo de entrega. Si dejas el precio vacío, el bot dice que la cotización es personalizada.
- **Forma de trabajo**: el esquema de 50% de anticipo y 50% a la entrega.
- **Preguntas frecuentes**: agrega las que más te hacen, con su respuesta.

Puedes probar los cambios en tu computadora antes de publicarlos, sin WhatsApp:

```bash
npm install
```

```bash
ANTHROPIC_API_KEY=sk-ant-... npm run simular
```

## Avisos y comandos

Los avisos llegan a tu WhatsApp personal (`OWNER_WHATSAPP`). Desde ese mismo número puedes mandarle comandos al número del bot:

| Comando | Qué hace |
|---|---|
| `/prospectos` | Muestra los últimos 10 prospectos calificados |
| `/responder 5215512345678 Hola, te mando la cotización…` | Le escribes tú a la persona desde el número del negocio. El bot se pausa con ella. |
| `/pausar 5215512345678` | El bot deja de responderle a esa persona |
| `/activar 5215512345678` | El bot vuelve a responderle |
| `/reiniciar 5215512345678` | Borra el historial con esa persona |
| `/ayuda` | Muestra la lista de comandos |

Si le escribes al bot desde tu número **sin** `/`, te responde como a un prospecto. Sirve para probarlo.

> **Importante sobre los avisos:** WhatsApp solo permite mensajes libres a quien escribió en las últimas 24 horas. Para que los avisos te lleguen siempre:
> - **Opción simple:** mándale cualquier mensaje al bot una vez al día.
> - **Opción recomendada:** en el administrador de WhatsApp de Meta crea una plantilla de categoría **Utilidad**, por ejemplo con el cuerpo `Aviso del asistente: {{1}}`. Cuando la aprueben, pon su nombre en `OWNER_ALERT_TEMPLATE`.

## Reglas de WhatsApp (para que no bloqueen tu número)

- **No envíes mensajes masivos ni en frío** a números que no te dieron permiso. Meta baja la calidad del número cuando la gente reporta o bloquea, y termina restringiéndolo. Por eso este bot **solo responde**; no inicia conversaciones.
- La forma de conseguir conversaciones es que la gente te escriba primero: anuncios de Facebook e Instagram que abren WhatsApp, el enlace `https://wa.me/TUNUMERO` en tu bio, web y tarjetas, o un código QR.
- Si tu equipo contacta prospectos, que lo haga en persona y les comparta el enlace `wa.me` del número del bot. Para el primer mensaje desde el número del negocio, Meta exige una plantilla aprobada y el consentimiento de la persona.

## Para desarrolladores

```bash
npm run typecheck
```

```bash
npm test
```

- `api/webhook.ts`: endpoint para Meta. Verifica la firma `X-Hub-Signature-256`, responde 200 de inmediato y procesa en segundo plano con `waitUntil`.
- `lib/bot.ts`: deduplicación de mensajes, candado por conversación, pausas, avisos y comandos.
- `lib/agente.ts`: llamada a Claude con dos herramientas (`registrar_prospecto_calificado` y `pasar_a_humano`). El historial solo crece al final.
- `lib/store.ts`: Redis (Upstash), con una versión en memoria para pruebas.
- `lib/whatsapp.ts`: cliente de la Cloud API de WhatsApp.
- Modelo: `claude-opus-5-5` con esfuerzo `low`. Con `CLAUDE_MODEL=claude-sonnet-5-5` cuesta aproximadamente la mitad.
- Si un filtro de seguridad de Claude rechaza una respuesta, el bot la reintenta automáticamente con otro modelo (`fallbacks: "default"`).
