# Cambios a las rutinas · para pegar

Por seguridad, cada rutina solo se puede modificar desde **su propia conversación**. Abre cada conversación en la app de Claude, pega el bloque que le corresponde y confirma. Cada uno es un solo mensaje.

---

## 1. Prospección diaria (8:52) · quitar el video y publicar muestras

Abre la conversación donde llegan los resultados de **"Prospección diaria SV web studio"** y pega esto:

```
Actualiza esta rutina (la de 8:52, "Prospección diaria SV web studio") con update_trigger y reemplaza todo su prompt por el texto que va entre las líneas ===. No cambies el horario.

===
Rutina diaria de prospección para Franco (SV WebStudio, Lima, Perú; webs desde S/ 300, ver /mnt/project-files/svwebstudio.zip y https://sv-web-studio.vercel.app/). DESDE EL 26/10 EL MÉTODO CAMBIÓ: ya no hay video de 90 s. Lo que convierte es una MUESTRA PUBLICADA con las fotos y datos reales del negocio, enviada por WhatsApp con su link. Usa como referencia de formato /mnt/project-files/prospeccion/2026-10-10.md, pero sin guiones de video. No escribas a ningún prospecto: Franco envía los mensajes.

Cada día:
1. NICHO. Lee /mnt/project-files/prospeccion/registro.md. Rota en este orden y repite el ciclo: (a) casas de reposo y centros geriátricos, (b) clínicas dentales, (c) casas de reposo y centros geriátricos, (d) fisioterapia y rehabilitación, (e) un rubro con dinero distinto a los de los últimos 7 días (veterinarias, talleres, academias, asesorías, etc.). Siempre en Lima, salvo que Franco pida otro. Nunca uses negocios que ya estén en el registro con cualquier estado. Art & Glass Vitrales está descartado.
2. BUSCAR 5 negocios con web mala o sin web, que tengan un celular o WhatsApp público (obligatorio: sin número no sirve). Fuentes: WebSearch, WebFetch, curl, Playwright (Chromium ya está instalado; no ejecutes "playwright install"), paginasamarillas.com.pe con Playwright, Facebook e Instagram públicos. Si GOOGLE_PLACES_API_KEY está en el entorno, saca estrellas, número de reseñas y 2 o 3 reseñas reales; si no, dilo y no inventes datos. Si algún sitio no carga, dilo y no lo reemplaces con datos inventados.
3. AUDITAR cada uno (con web: abrirla con Playwright a 390 px; teléfono tocable con tel: correcto, WhatsApp que funciona, se corta en el celular, textos de plantilla, año viejo, botones rotos). Elige UN fallo concreto y verificado que le cuesta clientes; nunca inventes un fallo. Busca el nombre del dueño, director o doctor; si no lo encuentras, dilo.
4. MUESTRAS. Para los 2 mejores prospectos del día (los que tienen más que ganar y un WhatsApp claro), arma una landing de muestra en /mnt/project-files/prospeccion/maquetas/<negocio>/index.html con su logo, fotos, colores, servicios, sedes y datos REALES descargados de su web, ficha o redes (guárdalos junto a la maqueta). Reglas: banda visible arriba "Muestra gratuita preparada por SV WebStudio para <Negocio>"; <meta name="robots" content="noindex, nofollow">; botón de WhatsApp de ELLOS y teléfono tocable; mapa si tiene dirección; revisarla con Playwright a 390 px sin scroll horizontal. Nada de fotos genéricas ni reseñas inventadas; si no pudiste bajar sus recursos, dilo y elige otro prospecto. Para casas de reposo, inspírate en el estilo de https://canitas-felices.vercel.app y https://hogar-virgen-del-carmen.vercel.app.
5. PUBLICAR cada muestra con el conector de Vercel (equipo team_CYGc5J2AocydPdOjJCOoUSvV; create_deployment con target "production", projectSettings {"framework": null} y el nombre <negocio-en-minusculas-con-guiones>-muestra). La URL pública queda como https://<nombre>.vercel.app: ábrela con curl y confirma que responde 200 y que es tu página. No la publiques como Artifact. Si el conector de Vercel no está disponible o falla, no reintentes en bucle: deja la carpeta lista y dilo.
6. MENSAJES. Para cada uno de los 5, escribe el mensaje corto de WhatsApp (o Instagram/Facebook si no hay WhatsApp), sin precio, saludando por nombre si lo tienes y con usted:
   - Con muestra publicada: "Buenas, [nombre]. Soy Franco, de SV WebStudio. Revisé la web de [Negocio] desde el celular y [fallo concreto]. Le preparé una muestra de cómo podría verse, con sus fotos y datos: [URL real]. Ábrala desde el celular. Si le gusta, la conversamos; si no, no pasa nada."
   - Sin muestra: "Buenas, [nombre]. Soy Franco, de SV WebStudio. Revisé la web de [Negocio] desde el celular y [fallo concreto]. ¿Le preparo gratis una muestra de cómo podría verse? La ve en su celular y decide, sin compromiso."
   - Para casas de reposo sin muestra, puedes añadir al final: "Aquí le dejo lo que hacemos para casas de reposo: https://sv-casas-de-reposo.vercel.app"
   Nunca pongas "[link]" ni marcadores sin reemplazar: o va la URL real, o va la versión sin muestra.
7. GUARDAR todo en /mnt/project-files/prospeccion/AAAA-MM-DD.md (por negocio: nombre, rubro, distrito, contacto y canal, web, fallo, dueño, URL de la muestra o "sin muestra", mensaje listo para copiar) y añade los 5 al registro con estado "Mensaje listo DD-oct (muestra: URL | sin muestra)". Relee el registro antes y después de editarlo.
8. RESPONDE en este hilo, en español y corto: lo que hiciste tú (✓) y lo que le toca a Franco hoy (○ mandar los 5 mensajes, en orden de prioridad). Pon los 5 mensajes listos para copiar con su número. Adjunta el .md. Recuérdale la regla: si alguien no responde a 2 mensajes, se descarta; y que avise aquí quién respondió para preparar la propuesta con precio (Landing S/ 300, Premium S/ 500, mantenimiento S/ 60/mes, precio de lanzamiento hasta el 31/12).
===
```

---

## 2. 10 correos diarios (10:55) · priorizar los nichos

Abre la conversación de **"10 correos diarios a negocios pequeños"** y pega esto:

```
Actualiza esta rutina (la de 10:55, "10 correos diarios a negocios pequeños") con update_trigger. Mantén todo su prompt igual y solo haz estos dos cambios:

1) En el paso 3, justo después de "Busca 10 negocios pequeños de Lima con correo público, de DOS tipos, apuntando a una mezcla (idealmente 5 y 5; si un tipo escasea, completa con el otro):", agrega esta frase: "PRIORIDAD DE RUBROS desde el 26/10: al menos 6 de los 10 deben ser casas de reposo, centros geriátricos, clínicas dentales o centros de fisioterapia; los otros 4, de rubros distintos. Páginas Amarillas ya casi no tiene negocios sin web en las categorías usadas: busca también con WebSearch, en Facebook e Instagram públicos y en directorios de salud."

2) En las dos plantillas (CORREO X y CORREO Y), cuando el negocio sea una casa de reposo o un centro geriátrico, cambia los ejemplos "(por ejemplo: http://kiarapersonalized.vercel.app y http://gladiadores-lima.vercel.app)" o "(ejemplos: ...)" por "(así trabajamos con casas de reposo: https://sv-casas-de-reposo.vercel.app)". Para los demás rubros deja los ejemplos como están.

No cambies el horario ni nada más.
```

---

## 3. Panel diario (17:30) · sin videos y sin el error de SV Equipo

Abre la conversación **"Notificaciones rutina diaria de correos"** (la del panel) y pega esto:

```
Actualiza esta rutina (la de 5:30 pm, "Panel diario SV WebStudio") con update_trigger. Mantén todo su prompt igual y solo haz estos tres cambios:

1) En el PASO 3, en la regla de prioridad 3, reemplaza "(si el mensaje lleva [link], su que_hacer empieza con grabar el video)" por "(desde el 26/10 ya no hay videos: cada mensaje trae el link real de la muestra publicada en vercel.app; si la prospección dice que una muestra no se pudo publicar, su que_hacer empieza con 'Publicar la muestra: arrastra la carpeta a vercel.com/new')".

2) En el PASO 3, antes de la regla de prioridad 1, agrega la prioridad 0: "Cierres en curso (están en sv-webstudio/escalar/CIERRES.md de la rama claude/epic-curie-emcmxo del repo efarko/claude): Canitas Felices, Hogar Geriátrico Virgen del Carmen y Productora Roxste, mientras Franco no diga que se cerraron o se descartaron. Art & Glass Vitrales está descartado: no lo pongas en pendientes."

3) Agrega al final del PASO 3: "SV Equipo: jesussalap@gmail.com (aparece como 'Douglas Salas') es Jesús Salas, socio de Franco, y franco.valladares@gmail.com usa el número de Franco (957 636 046). Nunca recomiendes rechazar esas solicitudes."

No cambies el horario ni nada más.
```

---

## 4. Seguimientos (16:51)

Sin cambios.
