# SV Equipo

Sistema interno de SV WebStudio para la ronda diaria de WhatsApp y llamadas.

- **Ingreso:** correo + código de acceso de 6 dígitos (te llega a ti cuando alguien se registra) + un código nuevo por correo en cada ingreso.
- **Closer:** 15 WhatsApp distintos por día con el mensaje listo y 20 llamadas por bloque. Cada número se desbloquea solo después de tocar «Llamar» y marcar Interesado / No interesado / No contestó. «No contestó» se repite otro día (hasta 3 intentos).
- **Panel (solo el dueño):** solicitudes, equipo, roles, actividad, interesados y prospectos (importar / pedir más).

## Instalación en Vercel (una sola vez)

1. **Importar el proyecto:** vercel.com/new → elige el repositorio → **Root Directory: `sv-equipo`** → Deploy. En Settings → Environments → Production, la rama de producción debe ser la que tiene este código (hoy `claude/elegant-rubin-0f0oly`).
2. **Base de datos:** en el proyecto → Storage → Create → **Neon (Postgres)** → conéctala al proyecto. Esto crea `DATABASE_URL` sola.
3. **Variables** (Settings → Environment Variables):
   - `OWNER_EMAIL`: tu correo (el que será dueño).
   - `GMAIL_USER`: el Gmail desde el que salen los correos.
   - `GMAIL_APP_PASSWORD`: una contraseña de aplicación de ese Gmail (myaccount.google.com → Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones).
4. Redeploy. Entra al sitio → «Pedir acceso» con tu `OWNER_EMAIL` → te llega tu código de dueño.
5. Panel → Prospectos → Importar la lista inicial (archivo JSON).

Las tablas se crean solas la primera vez. No se guarda ningún dato de prospectos en este repositorio.

## Formato para importar

```json
[{ "name": "Negocio", "problem": "El número no se puede tocar", "need": "arreglo",
   "wa": "987654321", "phones": [{ "label": "Fijo", "tel": "(01) 234-5678" }],
   "msg": "Opcional. Usa {closer} para el nombre de quien envía." }]
```

`need` es `arreglo` o `nueva`. Los repetidos (mismo nombre o mismo WhatsApp) se ignoran.

## Probar en local

```
DATABASE_URL=postgres://... OWNER_EMAIL=tu@correo MAIL_LOG=/tmp/mail.log node scripts/dev.mjs
```

Con `MAIL_LOG` los correos se escriben en ese archivo en vez de enviarse.
