# Bot de WhatsApp de SV WebStudio

Responde los WhatsApp del negocio con Claude: atiende a quien escribe, explica los planes, ofrece la muestra gratis, pide los datos para hacerla y lleva al cliente a pagar el adelanto. Cuando algo necesita a Franco (un pago que confirmar, un descuento, una queja, un audio o una foto), le manda un correo.

- Si Franco escribe en un chat desde su celular, el bot se calla en ese chat por 12 horas (`BOT_HUMAN_HOURS`).
- Cada correo de aviso trae dos links: callar el bot en ese chat o volver a encenderlo.
- Si el cliente manda varios mensajes seguidos, el bot espera unos segundos y responde todo junto.
- Los precios y planes están en `lib/negocio.js`. Si cambian, se cambian ahí.

## Quién abre las cuentas

**Anthropic exige que la cuenta la abra una persona mayor de 18 años**, y Meta Business y WhatsApp son contratos con pagos. Las dos cuentas las tiene que abrir **un adulto** (mamá, papá o un socio mayor de edad), a su nombre y con su tarjeta. Franco no las abre con su DNI.

## Paso 1. Meta Business (lo hace el adulto)

1. Entrar a https://business.facebook.com con su cuenta de Facebook y crear un portafolio comercial llamado "SV WebStudio".
2. Entrar a https://developers.facebook.com → **Mis apps** → **Crear app** → caso de uso **"Conectar con clientes por WhatsApp"** → vincularla al portafolio "SV WebStudio".
3. En la app, **WhatsApp → Configuración de la API**, agregar el número.
   - **Opción A, coexistencia** (el 957 636 046 sigue funcionando en el celular de Franco): el 957 tiene que estar en la app **WhatsApp Business** (no en WhatsApp normal), versión 2.24.17 o más nueva. Si Meta ofrece "conectar un número de la app WhatsApp Business", se sigue ese camino: se confirma con un código o un QR desde la app.
   - **Opción B, número aparte**: si la coexistencia no aparece en la configuración directa (Meta la ofrece sobre todo por medio de proveedores), se usa un chip prepago nuevo solo para el bot. Ese número no puede estar en ninguna app de WhatsApp.
4. **Configuración del negocio → Usuarios del sistema** → crear uno de tipo administrador → **Asignar activos**: la app y la cuenta de WhatsApp, con control total → **Generar token** con los permisos `whatsapp_business_messaging` y `whatsapp_business_management`. Ese token es `WA_TOKEN`.
5. En **WhatsApp → Configuración de la API**, copiar el **ID del número de teléfono** (`WA_PHONE_NUMBER_ID`).
6. En **Configuración de la app → Básica**, copiar la **clave secreta de la app** (`WA_APP_SECRET`).

Los tokens y claves se pegan directo en Vercel (Paso 3). Nunca se mandan por chat ni por correo.

## Paso 2. Anthropic (lo hace el adulto)

1. Entrar a https://console.anthropic.com y crear la cuenta con su correo.
2. **Billing**: agregar la tarjeta y comprar créditos (el mínimo es US$ 5; con el volumen actual alcanza para varias semanas).
3. **API Keys → Create Key**, nombre "bot-whatsapp". Esa clave es `ANTHROPIC_API_KEY` y solo se muestra una vez.
4. Recomendado: en **Limits**, poner un tope de gasto mensual (por ejemplo US$ 10).

## Paso 3. Publicar en Vercel

Se crea un proyecto con **Root Directory** `sv-whatsapp-bot`, se le conecta una base de datos Neon (Storage) y se cargan estas variables:

| Variable | Qué es |
|---|---|
| `DATABASE_URL` | La pone Vercel al conectar Neon |
| `WA_TOKEN` | Token del usuario del sistema (Paso 1.4) |
| `WA_PHONE_NUMBER_ID` | ID del número (Paso 1.5) |
| `WA_APP_SECRET` | Clave secreta de la app (Paso 1.6) |
| `WA_VERIFY_TOKEN` | Una palabra secreta inventada; se usa una vez en el Paso 4 |
| `ANTHROPIC_API_KEY` | Clave de Anthropic (Paso 2.3) |
| `BOT_ADMIN_SECRET` | Otra palabra secreta larga inventada (firma los links de los correos) |
| `BOT_URL` | La dirección del proyecto, por ejemplo `https://sv-whatsapp-bot.vercel.app` |
| `OWNER_EMAIL` | Correo donde llegan los avisos |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | El mismo Gmail y la misma clave de 16 letras que usa SV Equipo |

Opcionales: `CLAUDE_MODEL` (por defecto `claude-opus-5-5`), `BOT_WAIT_MS` (por defecto 6000), `BOT_HUMAN_HOURS` (por defecto 12), `WA_GRAPH_VERSION` (por defecto `v23.0`).

## Paso 4. Conectar el webhook

En la app de Meta, **WhatsApp → Configuración**:
1. **URL de devolución de llamada**: `https://<tu-proyecto>.vercel.app/api/webhook`
2. **Token de verificación**: el mismo `WA_VERIFY_TOKEN`.
3. **Campos del webhook**: suscribir `messages` y, si se usa coexistencia, `smb_message_echoes` (así el bot sabe cuándo escribe Franco).

Para probar, se escribe al número desde otro celular. La respuesta llega en unos 10 segundos.

## Costos aproximados

- Meta: responder a quien escribe primero es gratis. Los mensajes que inicia la empresa con plantilla cuestan unos US$ 0.07–0.08 cada uno en Perú (el bot no los usa).
- Claude: unos US$ 0.01–0.03 por respuesta con `claude-opus-5-5`; con 500 respuestas al mes, unos US$ 10.
- Vercel y Neon: plan gratis.

## Límites

- El bot solo **responde**. No sirve para escribirle en frío a muchos negocios: Meta exige permiso previo y puede bloquear el número.
- No ve audios, fotos ni documentos: avisa a Franco.
- Nunca confirma un pago: eso lo hace Franco revisando su Yape o Plin.

## Prueba local

```bash
npm install
DATABASE_URL=postgres://usuario@127.0.0.1:5433/svbot npm test
```

Simula a Meta y a Claude, sin gastar nada.
