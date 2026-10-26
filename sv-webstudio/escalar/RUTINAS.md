# Cambios a las rutinas · versión 2 (SV Equipo automático)

Cada rutina solo se puede modificar desde **su propia conversación**. Pega cada bloque en la suya. **Después de pegarlos, avísame:** al cambiarlas la última vez quedaron pausadas y tuve que volver a encenderlas.

Antes de pegar nada, guarda la clave (paso 0).

---

## 0. Guardar la clave de SV Equipo (1 minuto)

En la app de Claude, en esta sesión: menú del entorno en la barra de título → **Edit** → variables de entorno (o "Network secrets / API credentials" si aparece). Agrega:

- **Nombre:** `SV_BOT_TOKEN`
- **Valor:** el que está en el archivo `bot_token.txt` que te mandé

Ya está guardada del lado de SV Equipo (Vercel). Las rutinas la leen desde el entorno, así que nunca aparece en sus textos.

---

## 1. Prospección diaria (8:52) · reemplazo completo

Pega esto en la conversación de **"Prospección diaria SV web studio"**:

```
Actualiza esta rutina (la de 8:52, "Prospección diaria SV web studio") con update_trigger y reemplaza todo su prompt por el texto que va entre las líneas ===. No cambies el horario y déjala encendida.

===
Rutina diaria de prospección para Franco (SV WebStudio, Lima, Perú; webs desde S/ 300, https://sv-web-studio.vercel.app/). Desde el 26/10: sin videos; cada prospecto recibe una MUESTRA PUBLICADA con sus fotos y datos reales, y todo se carga directo en SV Equipo (https://sv-equipo.vercel.app), donde Franco y su equipo envían los WhatsApp. No escribas a ningún prospecto.

CONEXIÓN CON SV EQUIPO: usa curl con la variable de entorno SV_BOT_TOKEN (nunca la imprimas ni la escribas en archivos). Cabeceras: -H "Authorization: Bearer $SV_BOT_TOKEN" -H "X-SV: 1" -H "Content-Type: application/json".
- Estado: GET https://sv-equipo.vercel.app/api/bot?a=status → {pool:{wa,calls}, names:[negocios que ya existen]}.
- Cargar: POST https://sv-equipo.vercel.app/api/bot?a=import con {"items":[...], "reserve_email":"..."} (máximo 200 por vez). Cada item: {"name","wa":"9XXXXXXXX","problem":"una frase corta del fallo, empezando en minúscula","need":"arreglo|nueva","category","district","web","phones":[{"label":"Fijo","tel":"(01) 234-5678"}]} y, si tiene muestra, también "demo":"https://...vercel.app" y "msg":"mensaje completo de WhatsApp".
Si SV_BOT_TOKEN no existe o la API falla, no reintentes en bucle: guarda los mensajes en el .md del día y dilo claramente al final.

Cada día:
1. NICHO. Lee /mnt/project-files/prospeccion/registro.md y llama a status. Rota en este orden y repite el ciclo: (a) casas de reposo y centros geriátricos, (b) clínicas dentales, (c) casas de reposo y centros geriátricos, (d) fisioterapia y rehabilitación, (e) un rubro con dinero distinto a los de los últimos 7 días. Siempre en Lima. Nunca uses negocios que ya estén en el registro o en names de status. Art & Glass Vitrales, Hogar Geriátrico Virgen del Carmen y Productora Roxste están descartados.

2. LOS 5 CON MUESTRA (para Franco).
   a) Busca 5 negocios del nicho del día con web mala o sin web y con un celular de WhatsApp público (obligatorio). Fuentes: WebSearch, WebFetch, curl, Playwright (Chromium ya está instalado; no ejecutes "playwright install"), paginasamarillas.com.pe con Playwright, Facebook e Instagram públicos. Nunca inventes datos; si un sitio no carga, dilo.
   b) Audita cada uno (con web: Playwright a 390 px; teléfono tocable, WhatsApp que funcione, se corta en el celular, textos de plantilla, año viejo, botones rotos). Elige UN fallo concreto y verificado. Busca el nombre del dueño, director o doctor.
   c) Arma una muestra para cada uno en /mnt/project-files/prospeccion/maquetas/<negocio>/index.html con su logo, fotos, colores, servicios, sedes y datos REALES descargados de su web, ficha o redes. Reglas: banda arriba "Muestra gratuita preparada por SV WebStudio para <Negocio>"; <meta name="robots" content="noindex, nofollow">; botón de WhatsApp de ELLOS y teléfono tocable; mapa si tiene dirección; revisada con Playwright a 390 px sin scroll horizontal. Nada de fotos genéricas ni reseñas inventadas; si no consigues sus recursos, cambia de negocio. Para casas de reposo, guíate por https://canitas-felices.vercel.app.
   d) Publica cada muestra con el conector de Vercel (equipo team_CYGc5J2AocydPdOjJCOoUSvV; create_deployment, target "production", projectSettings {"framework": null}, nombre <negocio-en-minusculas-con-guiones>-muestra) y confirma con curl que https://<nombre>.vercel.app responde 200. No la publiques como Artifact. Si Vercel falla, ese negocio va sin demo.
   e) Mensaje (campo msg), con usted y sin precio: "Buenas, [nombre]. Soy Franco, de SV WebStudio. Revisé la web de [Negocio] desde el celular y [fallo concreto]. Le preparé una muestra de cómo podría verse, con sus fotos y datos: [URL real]. Ábrala desde el celular. Si le gusta, la conversamos; si no, no pasa nada." Si no hay muestra publicada, no pongas msg (SV Equipo arma uno solo).
   f) Cárgalos con import y "reserve_email":"efarko.valladares@gmail.com". Así salen solo a Franco, primero y con la etiqueta «Muestra lista». Revisa que added sea 5 (o explica por qué no).

3. RELLENAR LA LISTA DEL EQUIPO. Si pool.wa de status es menor que 45, busca negocios nuevos de los nichos (casas de reposo, clínicas dentales, fisioterapia y, si escasean, otros rubros con dinero) hasta subir el pool a unos 60, con un máximo de 30 por día. Cada uno con WhatsApp válido, un fallo verificado (o "no tiene una página web propia" si no tiene web) y need correcto. Sin muestra y sin msg. Cárgalos con import SIN reserve_email.

4. GUARDAR en /mnt/project-files/prospeccion/AAAA-MM-DD.md: los 5 con muestra (negocio, contacto, fallo, URL de la muestra, mensaje) y la lista de los cargados al pool. Añádelos todos al registro con estado "En SV Equipo DD-oct". Relee el registro antes y después de editarlo.

5. RESPONDE en este hilo, corto y en español: cuántas muestras se publicaron (con sus URL), cuántos se cargaron a SV Equipo (reservados para Franco y para el equipo), cómo quedó el pool y cualquier fallo. Termina con: "Tu ronda está en https://sv-equipo.vercel.app: 5 con muestra arriba y 10 normales."
===
```

---

## 2. Panel diario (17:30) · ya no copia mensajes

Pega esto en la conversación **"Notificaciones rutina diaria de correos"**:

```
Actualiza esta rutina (la de 5:30 pm, "Panel diario SV WebStudio") con update_trigger. Mantén todo su prompt igual y solo haz este cambio, y déjala encendida:

En el PASO 3, reemplaza la regla de prioridad 3 completa (la que empieza con "3) los mensajes de la prospección de hoy") por: "3) una sola fila, canal WhatsApp, negocio 'Ronda de SV Equipo', que_hacer 'Enviar tus 15 WhatsApp en SV Equipo (5 con muestra arriba y 10 normales) y marcar quién responde', enlace 'https://sv-equipo.vercel.app/app', mensaje vacío. No copies los mensajes de la prospección: ya están cargados en SV Equipo. Si la prospección de hoy dice que no pudo cargar a SV Equipo, agrega una fila canal Decidir con ese problema."

En el PASO 1, la rutina "10 correos diarios" está pausada a propósito desde el 26/10: no la reportes como falla.
```

---

## 3. Seguimientos (16:51)

Sin cambios. Se pausa sola el 3/11.
