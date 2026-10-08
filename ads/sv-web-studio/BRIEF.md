# BRIEF — SV WebStudio

Fuente: https://sv-web-studio.vercel.app/ (HTML, `css/style.css`, `js/config.js`, `js/main.js`), revisada el 2026-10-08.
Copia de la configuración del sitio en esa fecha: [`brand/site-config.snapshot.js`](brand/site-config.snapshot.js).

Cada dato lleva su fuente. Lo que no aparece en el sitio está marcado como **no confirmado**.

## Identidad

| Dato | Valor | Fuente |
|---|---|---|
| Nombre | **SV WebStudio** (en la web se escribe "WebStudio" junto; el dominio dice `sv-web-studio`) | `og:site_name`, nav, footer |
| Ubicación | Estudio web · Lima, Perú | hero, footer ("Hecho en Lima, Perú") |
| Propuesta | "Convertimos tus seguidores de Instagram en clientes que te escriben por WhatsApp." | hero, meta description |
| Qué venden | Landing pages a medida para negocios de Lima: restaurantes, clubes, tiendas y emprendimientos | hero |
| Tagline del footer | "Landing pages enfocadas en conversión, para negocios de Lima." | footer |
| Equipo | Jesús Salas y Franco Vallardes, cofundadores (diseño y desarrollo). "Dos dueños, trato directo contigo" | sección Quiénes somos |

## Logo

- No hay un archivo de logo descargable (ni SVG ni PNG). El logo es un **cuadro redondeado con degradado navy → azul y las letras "SV" en blanco**, hecho con CSS (`.brand__mark`) y como SVG en el favicon.
- Favicon original guardado tal cual: [`brand/logo-favicon.svg`](brand/logo-favicon.svg) (rect 100×100, rx 22, degradado `#0e142a → #1c5cc6 → #2d87ff`, "SV" blanco). Nota: los `offset` del degradado del favicon están escritos como `55` y `100` en lugar de `0.55`/`1`, así que en el navegador el degradado se ve casi sin transición.
- Versión de referencia en la imagen OG ([`brand/og-image.png`](brand/og-image.png)): "SV" en Bricolage Grotesque Bold sobre el degradado `--brand-gradient-logo: linear-gradient(118deg, #0e142a 8%, #1c5cc6 52%, #2d87ff 92%)`.
- Proporción del cuadro en la web: 30×30 px con radio de 9 px (0,30 del lado).

## Colores (hex, tal cual en `css/style.css`)

| Rol | Hex | Comentario en el CSS |
|---|---|---|
| Navy del logo | `#0e142a` | "el navy exacto del logo" |
| Azul del logo | `#2d87ff` | "el azul de la V y de web" |
| Azul oscuro del degradado | `#1c5cc6` | "el extremo oscuro de su degradado" |
| Verde de acción (WhatsApp) | `#25d366` | "base de marca"; solo para botones y enlaces de contacto |
| Verde claro (degradado de texto) | `#5ce08d` | usado en `--brand-gradient-text` |
| Azul claro (degradado de texto) | `#5aa3ff` | usado en `--brand-gradient-text` |
| Fondo | `#070a14` | `--bg`, también `theme-color` |
| Fondo alterno | `#0a0f1d` | `--bg-alt` |
| Texto | `#f8f8fa` | `--text` |
| Texto atenuado | `#a3a3ae` | `--text-muted` |
| Texto sobre verde | `#06170d` | `--on-accent` |

Regla de la marca (comentario del CSS): "el azul identifica y el verde convierte". Ámbar `#f5a524`, rosa `#f472b6` y carmesí `#ef4444` son solo acentos del portafolio.

## Tipografías

- **Bricolage Grotesque** (400, 700–800): títulos y logo (`--font-display`). Archivos Regular y Bold descargados en `brand/fonts/`.
- **Instrument Sans** (400, 600–800): texto. Archivos Regular y Bold descargados en `brand/fonts/`.
- **JetBrains Mono** (400, 600–800): etiquetas en mayúsculas (se ve en la imagen OG). Archivo Bold descargado en `brand/fonts/`.

## Planes y precios

Los dos son de **pago único** ("pagas la web una vez y es tuya"). **Precio cerrado antes de empezar.** Ninguno usa plantillas.

S/300 y S/500 son **precios de lanzamiento** (badge "Precio de lanzamiento"), **válidos hasta el 31/12/2026** (`lanzamientoHasta: "2026-12-31"`). Pasada esa fecha, la web muestra el precio regular. En el HTML sin JavaScript aparece "Escríbenos por WhatsApp y te pasamos los precios actualizados".

### Landing — S/300 (regular S/390)
"Presencia digital profesional". Para negocios que todavía no tienen web.
- Una página con lo esencial de tu negocio
- Diseño a tu medida, no una plantilla
- WhatsApp integrado en toda la página
- Se ve bien en celular, tablet y computadora
- Lista para compartir en Instagram y Google
- Hasta 5 secciones · Ordenamos los textos que nos envías · 1 ronda de ajustes
- **Entrega: 3 a 5 días hábiles**

### Landing Premium — S/500 (regular S/690) · "Recomendado"
"Estrategia y conversión". Para negocios que ya reciben interés y quieren cerrar más.
- Todo lo de Landing, con más profundidad
- Textos y estructura escritos para vender, no para rellenar
- Secciones según tu rubro: catálogo, reservas, casos, preguntas
- Galería de fotos y detalle visual sección por sección
- Enlace directo desde tu Instagram y TikTok
- Secciones sin límite fijo, según tu rubro · Escribimos los textos contigo · 3 rondas de ajustes
- **Entrega: 7 a 10 días hábiles**

Los plazos cuentan "desde que nos pasas tu contenido y aprobamos la propuesta" (FAQ).

### Complemento opcional: Mantenimiento — S/60 al mes
Cambios menores de contenido (textos, fotos, precios, horarios) y gestión del hosting. Se puede contratar después.

### No incluido
- **Dominio**: se cotiza aparte y se paga una vez al año al proveedor. Ellos lo dejan configurado.
- **Hosting**: se contrata aparte, a nombre del cliente (o va incluido en el mantenimiento).
- Reservas con calendario, catálogo con stock o pagos en línea: "lo vemos aparte".

## Tiempos del proceso (`config.proceso`)

Contacto: mismo día · Propuesta: 24 horas · Diseño: 3 a 10 días · Revisión: 1 a 2 días · Lanzamiento: el mismo día que apruebas.
Respuesta por WhatsApp: "normalmente el mismo día".
(En `config.js` estos tiempos llevan un `TODO: ajustar si los tiempos reales cambian`.)

## Garantías

- **Garantía formal (devolución, reembolso, satisfacción): no confirmado.** La palabra "garantía" no aparece en el sitio.
- Compromisos que sí aparecen:
  - "Precio cerrado antes de empezar", con alcance, tiempos y precio por escrito.
  - "No cobramos por cotizar." / "Si no te convence, ahí queda."
  - "La ves terminada antes de publicarla… Nada sale sin tu visto bueno."
  - Rondas de ajustes incluidas antes de publicar: 1 (Landing) y 3 (Premium).
  - "Sin contratos raros ni sorpresas."

## Prueba social

- **Proyectos publicados (verificables):**
  - Avelino Restaurante: reservas online (Landing Premium), https://avelino-restaurante.base44.app/
  - Gladiadores Lima: club de básquet, inscripción por WhatsApp (Landing Premium), https://gladiadores-lima.vercel.app/
  - Kiarapersonalized: regalos personalizados, catálogo + WhatsApp (Landing), https://kiarapersonalized.vercel.app/
- **Testimonios: no confirmado.** La sección existe pero está oculta (`mostrar: false`, lista vacía).
- Número de clientes, reseñas, métricas de conversión o resultados: **no confirmado.**

## Contacto

| Canal | Dato |
|---|---|
| WhatsApp | **+51 916 068 187** (https://wa.me/51916068187) |
| Instagram | **@sv.webstudio** (https://www.instagram.com/sv.webstudio) |
| TikTok | **@sv.webstudio** (https://www.tiktok.com/@sv.webstudio) |
| Correo | sv.webstudio2026@gmail.com |

Formas de pago: **no confirmado** ("Coordinamos la forma de pago por WhatsApp").

## Tono de voz

- **Tuteo, cercano y conversacional, en español peruano**: "¿Te cuadra cómo trabajamos?", "Cuéntanos tu idea, no hace falta que tengas todo definido — para eso estamos."
- **Directo y honesto, sin promesas infladas**: "No somos la opción más barata ni la más grande. Somos la que te contesta, te explica y te entrega." En `config.js`: "No prometas nada que no puedas cumplir".
- **Habla del problema real del dueño**: responder las mismas preguntas todos los días por WhatsApp, o que la gente se pierda en Instagram buscando precios.
- **Contraste de frases cortas**: "Tu Instagram muestra tu negocio. Tu web lo vende."
- **Emojis**: solo en el chat de ejemplo del hero (👋 🙌 ✅); los titulares no llevan.
- **Llamados a la acción**: "Quiero mi web", "Cotiza tu landing page", "Escríbenos por WhatsApp", "Solicitar propuesta".

## Frases de la web reutilizables en el anuncio (literales)

- "Tu Instagram muestra tu negocio. Tu web lo vende."
- "Sin una, pierdes clientes que ya estaban interesados."
- "Respondes las mismas preguntas por WhatsApp, todos los días, con cada cliente nuevo."
- "Te respondemos nosotros dos, normalmente el mismo día."
- "Hablas con quien hace tu web"
