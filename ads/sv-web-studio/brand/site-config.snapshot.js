/* ============================================================================
   SV WebStudio — CONFIGURACIÓN CENTRAL
   ----------------------------------------------------------------------------
   TODO lo que cambia seguido (precios, tiempos, textos variables, contacto)
   vive AQUÍ. No hace falta tocar el HTML para actualizarlo.

   Para cambiar precios: edita `planes.basica.precioAntes / precioAhora`
   y `planes.premium.precioAntes / precioAhora`. Nada más.
   ========================================================================== */

const SITE_CONFIG = {
  /* --- Contacto -------------------------------------------------------- */
  contacto: {
    // Número de WhatsApp en formato internacional, sin + ni espacios
    whatsapp: "51916068187",
    whatsappVisible: "+51 916 068 187",

    email: "sv.webstudio2026@gmail.com",

    instagramUsuario: "sv.webstudio",
    instagramUrl: "https://www.instagram.com/sv.webstudio",

    tiktokUsuario: "sv.webstudio",
    tiktokUrl: "https://www.tiktok.com/@sv.webstudio",
  },

  /* --- Por qué elegirnos ------------------------------------------------
     Diferenciales reales del estudio. No prometas nada que no puedas
     cumplir: esta sección es la que construye confianza. */
  porQueElegirnos: [
    {
      icono: "chat",
      titulo: "Hablas con quien hace tu web",
      texto:
        "Sin vendedores ni intermediarios. Los dos dueños diseñamos y programamos, así que lo que acuerdas por WhatsApp es lo que se construye.",
    },
    {
      icono: "regla",
      titulo: "Precio cerrado antes de empezar",
      texto:
        "Te pasamos alcance, tiempos y precio por escrito. Si no te convence, ahí queda: no cobramos por cotizar.",
    },
    {
      icono: "celular",
      titulo: "Pensada para quien llega del celular",
      texto:
        "Tu cliente te descubre en Instagram o TikTok y entra desde el teléfono. Diseñamos primero para esa pantalla, no al revés.",
    },
    {
      icono: "rayo",
      titulo: "Hecha a medida, no una plantilla",
      texto:
        "Cada web se arma alrededor de tu negocio: lo que vendes, lo que te preguntan y lo que necesita ver tu cliente para escribirte.",
    },
  ],

  /* --- Precios y planes ------------------------------------------------ */
  moneda: "S/",
  badgeDescuento: "Precio de lanzamiento",

  /* Hasta cuándo vale el precio de lanzamiento (AAAA-MM-DD, hora de Lima).
     La fecha se muestra como "Válido hasta el DD/MM".

     Pasado ese día la web deja de mostrar la promoción SOLA: aparece el
     precio regular sin tachar, sin badge y sin porcentaje, y los mensajes
     de WhatsApp pasan a mencionar el precio regular. No hay que tocar nada.

     Para quitar la promoción ya mismo: pon una fecha pasada.
     Para dejar el precio de lanzamiento sin vencimiento: pon null. */
  lanzamientoHasta: "2026-12-31",

  notaPago:
    "Los dos planes son de pago único: pagas la web una vez y es tuya. El mantenimiento mensual es aparte y opcional, lo decides tú.",

  /* Qué pasa con el dominio y el hosting. Se muestra debajo de los precios
     y también responde la pregunta frecuente correspondiente. */
  notaDominioHosting:
    "El dominio se cotiza aparte: el precio depende del nombre y la extensión que elijas, y se paga una vez al año directo al proveedor. Te decimos cuánto cuesta el tuyo antes de empezar y lo dejamos configurado y funcionando. El hosting también se contrata aparte, a nombre tuyo; si prefieres no ocuparte, el mantenimiento opcional incluye su gestión.",

  planes: {
    basica: {
      id: "basica",
      nombre: "Landing",
      titulo: "Presencia digital profesional",
      paraQuien: "Para negocios que todavía no tienen web",
      precioRegular: 390,
      precioLanzamiento: 300,
      descripcion:
        "Tu negocio presentado en serio: qué ofreces, por qué confiar en ti y cómo contactarte, en una sola página clara y rápida.",
      // Comparación concreta (se renderiza en la tabla de los planes)
      comparacion: {
        secciones: "Hasta 5 secciones",
        textos: "Ordenamos los textos que nos envías",
        ajustes: "1 ronda de ajustes",
        entrega: "3 a 5 días hábiles",
      },
      incluye: [
        "Una página con lo esencial de tu negocio",
        "Diseño a tu medida, no una plantilla",
        "WhatsApp integrado en toda la página",
        "Se ve bien en celular, tablet y computadora",
        "Lista para compartir en Instagram y Google",
      ],
    },
    premium: {
      id: "premium",
      nombre: "Landing Premium",
      titulo: "Estrategia y conversión",
      paraQuien: "Para negocios que ya reciben interés y quieren cerrar más",
      precioRegular: 690,
      precioLanzamiento: 500,
      destacado: true,
      badge: "Recomendado",
      descripcion:
        "Antes de diseñar estudiamos tu negocio: qué te preguntan, qué frena a tus clientes y qué necesitan ver para decidirse. La web se construye alrededor de eso.",
      comparacion: {
        secciones: "Secciones sin límite fijo, según tu rubro",
        textos: "Escribimos los textos contigo, pensados para vender",
        ajustes: "3 rondas de ajustes",
        entrega: "7 a 10 días hábiles",
      },
      incluye: [
        "Todo lo de Landing, con más profundidad",
        "Textos y estructura escritos para vender, no para rellenar",
        "Secciones según tu rubro: catálogo, reservas, casos, preguntas",
        "Galería de fotos y detalle visual sección por sección",
        "Enlace directo desde tu Instagram y TikTok",
      ],
    },
  },

  // Filas de la tabla comparativa (orden y etiqueta visible)
  filasComparacion: [
    { clave: "secciones", etiqueta: "Secciones" },
    { clave: "textos", etiqueta: "Redacción de textos" },
    { clave: "ajustes", etiqueta: "Rondas de ajustes" },
    { clave: "entrega", etiqueta: "Entrega estimada" },
  ],

  /* --- Mantenimiento (complemento opcional, no es un tercer plan) ------- */
  mantenimiento: {
    nombre: "Mantenimiento",
    precio: 60,
    periodo: "al mes",
    descripcion:
      "Si no quieres ocuparte de la web una vez publicada, nos encargamos nosotros.",
    incluye: [
      "Cambios menores de contenido: textos, fotos, precios, horarios",
      "Gestión del hosting: que la web siga en línea y actualizada",
    ],
    nota: "Opcional. Puedes contratarlo después, cuando lo necesites.",
  },

  notaAlcance:
    "¿Tu caso pide algo más grande — reservas con calendario, catálogo con stock o pagos en línea? Lo vemos aparte y te decimos con claridad qué implica antes de empezar.",

  /* --- Proceso: tiempos aproximados por paso --------------------------- */
  // TODO: ajustar si los tiempos reales cambian.
  proceso: {
    contacto: "Mismo día",
    propuesta: "24 horas",
    diseno: "3 a 10 días",
    revision: "1 a 2 días",
    lanzamiento: "El mismo día que apruebas",
  },

  /* --- Preguntas frecuentes --------------------------------------------
     `r` es lo que ve el visitante (siempre un texto presentable).
     `todo` es una nota SOLO para ti: nunca se renderiza en la página,
     pero aparece listada en la consola del navegador para que no se te olvide.
  --------------------------------------------------------------------- */
  faq: [
    {
      p: "¿Cuánto demora tener mi web lista?",
      r: "La Landing toma entre 3 y 5 días hábiles y la Premium entre 7 y 10, contados desde que nos pasas tu contenido y aprobamos la propuesta. Si tienes una fecha límite, dínoslo al escribir y te confirmamos si llegamos.",
    },
    {
      p: "¿Incluye dominio y hosting?",
      r: "DOMINIO_HOSTING", // se reemplaza por config.notaDominioHosting
      todo: "Confirmar con qué proveedor de hosting trabajan y el rango de precio del dominio, y reflejarlo en `notaDominioHosting`.",
    },
    {
      p: "¿Qué necesito enviarles para empezar?",
      r: "Tu logo si lo tienes, fotos de tu negocio o tus productos, y una idea de lo que quieres decir. Si no tienes textos listos no es problema: en la Landing los ordenamos nosotros y en la Premium los escribimos contigo.",
    },
    {
      p: "¿Y si después quiero cambiar algo?",
      r: "Cada plan incluye sus rondas de ajustes antes de publicar: 1 en Landing y 3 en Premium. Después de publicada, los cambios los coordinamos por WhatsApp y siempre te decimos antes si tienen costo.",
      todo: "Definir política y precio de los cambios posteriores a la publicación, y reflejarlo en esta respuesta.",
    },
    {
      p: "¿Cómo puedo pagar?",
      r: "Coordinamos la forma de pago por WhatsApp cuando te pasamos la propuesta, antes de empezar a trabajar.",
      todo: "Listar las formas de pago reales (Yape, Plin, transferencia, efectivo) y si se pide adelanto.",
    },
    {
      p: "Solo tengo Instagram, ¿igual me sirve?",
      r: "Sí, de hecho es el caso más común. Instagram sirve para que te descubran, pero no para explicar precios, horarios o todo tu catálogo. La web centraliza eso y deja un solo botón para que te escriban por WhatsApp, sin que tengas que repetir lo mismo cada día.",
    },
  ],

  /* --- Testimonios ------------------------------------------------------
     La sección está construida pero OCULTA hasta tener testimonios reales.
     Para activarla: pon `mostrar: true` y llena la lista.
     NO inventes testimonios: deben ser de clientes reales.
  --------------------------------------------------------------------- */
  testimonios: {
    mostrar: false,
    lista: [
      // { texto: "TODO: testimonio real", autor: "TODO: nombre", negocio: "TODO: negocio" },
    ],
  },
};
