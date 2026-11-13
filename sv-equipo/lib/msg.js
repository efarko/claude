// Mensajes y guiones. {closer} se reemplaza por el primer nombre de quien envía.
import { firstName } from './auth.js';

const lower = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : '');
const fill = (tpl, p, closer) =>
  tpl.replaceAll('{closer}', closer).replaceAll('{negocio}', p.name).replaceAll('{problema}', lower(p.problem || ''));

function greeting() {
  const h = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Lima', hour: 'numeric', hour12: false }).format(new Date()));
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

// Tipo de problema a partir del texto, para explicarlo en palabras simples.
// why: qué le pasa al cliente (llamada) · loss: qué pierde el negocio, para el WhatsApp · fix: qué hacemos exactamente.
const ISSUES = [
  {
    key: 'caida', short: 'Así, quien los busca ve un error y puede pensar que el negocio cerró.', re: /ya no abre|ya no muestra|dej[oó] de funcionar|no carga|no existe/i,
    why: 'Hoy, si un cliente busca su página, le aparece un error. Mucha gente piensa que el negocio cerró y llama a otro.',
    loss: 'Hoy, quien los busca encuentra un error y piensa que el negocio cerró. Ese cliente no pregunta: le escribe al siguiente resultado de Google.',
  },
  {
    key: 'sinweb', short: 'Quien compara opciones en Google suele escribirle al que sí tiene página, aunque no sea el mejor.', re: /no tiene (una )?p[aá]gina|no tiene web|no tienen? (una )?p[aá]gina|solo (tiene|aparece)/i,
    why: 'Hoy casi todos buscan en Google antes de llamar. Si no encuentran una página propia, con fotos y datos claros, eligen al negocio que sí la tiene.',
    loss: 'Hoy casi todos comparan 2 o 3 opciones en Google antes de escribir. Si no encuentran una página con fotos, servicios y un WhatsApp a un toque, le escriben a la competencia, aunque ustedes sean mejores.',
  },
  {
    key: 'seguro', short: 'Ese aviso hace que muchos cierren la página antes de escribirles.', re: /no segur|certificado/i,
    why: 'Ese aviso de «No seguro» asusta a los clientes: muchos cierran la página antes de ver lo que ofrecen.',
    loss: 'Ese aviso de «No seguro» que muestra el navegador asusta: muchos clientes cierran la página antes de ver lo que ofrecen, y ustedes nunca se enteran.',
    fix: 'Le activamos el certificado de seguridad (el candadito al lado de la dirección) para que el navegador deje de mostrar ese aviso.',
  },
  {
    key: 'whatsapp', short: 'El cliente que ya quería escribirles tiene que copiar el número a mano, y muchos no lo hacen.', re: /whatsapp/i,
    why: 'El cliente que quiere escribirles desde la web no puede hacerlo con un toque. Casi nadie se toma el trabajo de copiar el número a mano: se va con otro.',
    loss: 'El cliente que ya decidió escribirles tiene que copiar el número a mano. Casi nadie lo hace: cierra la página y le escribe al siguiente negocio que sí tiene el botón. Son clientes que ya estaban listos para comprarles.',
    fix: 'Dejamos el botón de WhatsApp abriendo directo el chat con ustedes y revisamos que todos los teléfonos de la web funcionen desde el celular.',
  },
  {
    key: 'telefono', short: 'El cliente que ya quería llamarlos toca el número y no logra comunicarse.', re: /tel[eé]fono|n[uú]mero|fijo|marca|conecta|llamar|llama|se toca/i,
    why: 'El cliente que entra desde el celular y toca su número para llamarlos no logra comunicarse, o termina llamando a otro número. Es justo el cliente que ya estaba decidido a contactarlos.',
    loss: 'El cliente que ya decidió llamarlos toca el número… y no pasa nada, o le contesta otra persona. No lo vuelve a intentar: llama al siguiente de Google. Y ustedes nunca se enteran de que lo perdieron.',
    fix: 'Corregimos los números de la web para que, con un solo toque, la llamada salga directo a ustedes, y agregamos un botón que abre su WhatsApp.',
  },
  {
    key: 'celular', short: 'Desde el celular se ve cortada, y la mayoría cierra una web así en segundos.', re: /se corta|no se adapta|de lado|se parte|celular|pantalla/i,
    why: 'Hoy casi todos entran desde el celular. Si la web se ve cortada o hay que moverla de lado, la persona la cierra en segundos y busca otra opción.',
    loss: 'Casi todos sus clientes entran desde el celular. Si la web se ve cortada o hay que moverla de lado, la cierran en segundos y eligen otra opción que se vea bien.',
    fix: 'Ajustamos la web para que se vea completa y ordenada en cualquier celular, sin tener que moverla de lado.',
  },
  {
    key: 'desactualizada', short: 'Es un detalle, pero da la impresión de que la web está abandonada.', re: /©|20\d\d|navidad|a[nñ]os de experiencia|lorem|plantilla|ingl[eé]s|button|no se lee|prueba|aviso/i,
    why: 'Parece un detalle pequeño, pero da la impresión de que la web está abandonada, y el cliente duda de si el negocio sigue atendiendo.',
    loss: 'Parece un detalle, pero el cliente lo nota: piensa que la web está abandonada y duda de si el negocio sigue atendiendo. Esa duda basta para que elija a otro.',
    fix: 'Actualizamos esos textos y datos para que la web se vea al día y transmita confianza.',
  },
];
const FALLBACK = {
  key: 'otro',
  short: 'Es de esos detalles que el dueño casi no ve, pero el cliente sí.',
  why: 'Esos detalles hacen que los clientes que llegan a su web se vayan sin contactarlos.',
  loss: 'Son detalles que el dueño casi nunca ve, pero el cliente sí: entra, algo no funciona y se va sin contactarlos.',
  fix: 'Corregimos esos detalles para que la web funcione bien desde el celular.',
};

export function issueOf(p) {
  return ISSUES.find((i) => i.re.test(p.problem || '')) || (p.need === 'nueva' ? ISSUES[1] : FALLBACK);
}

const isNew = (p, issue) => p.need === 'nueva' || issue.key === 'caida' || issue.key === 'sinweb';

// Ejemplo público del rubro (https://sv-ejemplos.vercel.app), según la categoría o el nombre del negocio.
const EJEMPLOS = [
  [/reposo|geri[aá]tric|adulto mayor|asilo/i, 'casas de reposo', 'casa-reposo'],
  [/dent|odont|ortodon/i, 'clínicas dentales', 'dental'],
  [/fisio|terapia f[ií]sica|rehabilit/i, 'centros de fisioterapia', 'fisioterapia'],
  [/veterin|mascota|\bpet/i, 'veterinarias', 'veterinaria'],
  [/taller mec|mec[aá]nic|automotr|automóvil/i, 'talleres', 'taller'],
  [/t[eé]cnic|electrodom|l[ií]nea blanca|lavadora|refriger/i, 'servicio técnico', 'servicio-tecnico'],
];
export function ejemploDe(p) {
  const text = `${p.category || ''} ${p.name || ''}`;
  const hit = EJEMPLOS.find(([re]) => re.test(text));
  return hit ? { rubro: hit[1], url: `https://sv-ejemplos.vercel.app/${hit[2]}/` } : null;
}

// Primer mensaje en frío: corto (unas 50 palabras), sin links y terminando en una pregunta de sí o no.
// Estructura: pregunta fácil o saludo → hallazgo concreto + lo que pierden en 1 frase → algo gratis y sin riesgo, pidiendo permiso.
// Hay 2 versiones (A y B) que se reparten por id para medir cuál consigue más interesados (ver Panel).
// Solo los prospectos con muestra publicada usan su mensaje propio (wa_msg).
export function variantOf(p) {
  if (p.wa_msg && p.demo_url) return 'muestra';
  return p.id % 2 ? 'B' : 'A';
}

export function waMessage(p, userName) {
  const closer = firstName(userName);
  if (p.wa_msg && p.demo_url) return fill(p.wa_msg, p, closer);
  const issue = issueOf(p);
  const correo = /correo/i.test(p.source || '') ? ' Hace unos días les escribí al correo sobre esto.' : '';
  const nueva = isNew(p, issue);
  const short = issue.short || FALLBACK.short;
  const v = variantOf(p);
  const lines = nueva
    ? (v === 'A'
      ? [
          `${greeting()}, ¿es el WhatsApp de {negocio}?`,
          `Soy {closer}, de SV WebStudio. Los busqué en Google desde el celular, como lo haría un cliente nuevo, y vi que {problema}. ${short}${correo}`,
          '¿Les preparo gratis un diseño de prueba con su nombre para que lo vean en su celular? Si les gusta, recién hablamos de precio.',
        ]
      : [
          `${greeting()}. Soy {closer}, de SV WebStudio.`,
          `Busqué a {negocio} en Google como lo haría un cliente y vi que {problema}. ${short}${correo}`,
          'Ya hicimos páginas para otros negocios de Lima. ¿Les muestro gratis cómo se vería la suya, con su nombre? Sin compromiso.',
        ])
    : (v === 'A'
      ? [
          `${greeting()}, ¿es el WhatsApp de {negocio}?`,
          `Soy {closer}, de SV WebStudio. Entré a su web como lo haría un cliente y vi que {problema}. ${short}${correo}`,
          '¿Les mando gratis una captura de dónde está el problema y cómo se arregla?',
        ]
      : [
          `${greeting()}. Soy {closer}, de SV WebStudio.`,
          `Revisando la web de {negocio} como lo haría un cliente, noté que {problema}. ${short}${correo}`,
          'Les puedo preparar gratis una versión ya corregida para que la comparen. Si les gusta, recién hablamos de precio. ¿Se la preparo?',
        ]);
  return fill(lines.join('\n\n'), p, closer);
}

// Segundo mensaje, para copiar cuando el negocio responde que sí. Aquí sí va el link de ejemplo.
export function waReply(p, userName) {
  const closer = firstName(userName);
  const issue = issueOf(p);
  const ejemplo = ejemploDe(p);
  const ej = ejemplo ? ` Mientras, así se ve una que hicimos para ${ejemplo.rubro}: ${ejemplo.url}` : ' Mientras, puede ver nuestros trabajos aquí: https://sv-web-studio.vercel.app';
  const txt = isNew(p, issue)
    ? `¡Genial! Para que el diseño salga con sus datos, ¿me confirma cómo quiere que aparezca el nombre del negocio y sus 2 o 3 servicios principales? Se lo envío en 24 horas.${ej}`
    : `¡Perfecto! Se lo preparo y se lo envío por aquí en 24 horas. ¿Con quién tengo el gusto?${ej}`;
  return fill(txt, p, closer);
}

export function waLink(p, userName) {
  return `https://wa.me/${p.wa_phone}?text=${encodeURIComponent(waMessage(p, userName))}`;
}

// Guion de llamada: 4 pasos principales (main) y respuestas rápidas.
export function callScript(p, userName) {
  const closer = firstName(userName);
  if (p.call_script) return [{ t: 'Guion', s: fill(p.call_script, p, closer), main: true }];
  const issue = issueOf(p);
  const nueva = isNew(p, issue);
  const problema = lower(p.problem || (nueva ? 'no tiene una página web propia' : 'tiene algunos detalles que hacen perder clientes'));

  const steps = [
    {
      t: '1. Saluda y pregunta por el encargado',
      s: `${greeting()}, ¿hablo con ${p.name}? Mi nombre es ${closer}, de SV WebStudio; hacemos páginas web para negocios de Lima. ¿Con quién puedo hablar sobre la página web del negocio?`,
    },
    {
      t: '2. Explica lo que encontraste',
      s: nueva
        ? `Le llamo porque buscamos a ${p.name} en internet y vimos que ${problema}. ${issue.why}`
        : `Le llamo porque revisamos su página web desde un celular, como lo haría un cliente, y encontramos un problema: ${problema}. ${issue.why}`,
    },
    {
      t: '3. Di qué hacemos',
      s: nueva
        ? `Nosotros le hacemos una página web profesional a ${p.name}: una página clara con sus servicios, fotos, su ubicación en Google Maps y un botón que abre directo su WhatsApp. Se ve bien en cualquier celular y queda lista en 48 horas.`
        : `${issue.fix || FALLBACK.fix} Normalmente queda listo en 1 a 3 días.`,
    },
    {
      t: '4. Propón la muestra gratis y cierra',
      s: nueva
        ? 'Para que vea cómo quedaría antes de decidir nada, le preparamos gratis un diseño de prueba de su página, con su nombre y sus servicios. Se lo enviamos por WhatsApp como un link: lo abre en su celular y ve exactamente cómo se vería. Si le gusta, conversamos; si no, no paga nada. ¿A qué número de WhatsApp se lo envío y a nombre de quién?'
        : 'Para que vea el cambio antes de decidir nada, le preparamos gratis una versión de prueba de su web ya corregida. Se la enviamos por WhatsApp como un link para que la abra en su celular y compare con la actual. Si le gusta, conversamos; si no, no paga nada. ¿A qué número de WhatsApp se la envío y a nombre de quién?',
    },
  ].map((x) => ({ ...x, main: true }));

  return [
    ...steps,
    { t: 'Si dice que sí', s: '¡Perfecto! Anoto el número y el nombre, y se la enviamos hoy o mañana. → Marca «Interesado» y escribe en la nota el WhatsApp, el nombre de la persona y lo que te dijo.' },
    { t: 'Si no es el encargado', s: '¿Me podría decir con quién hablo sobre la página web y a qué hora lo encuentro? → Anota el nombre y la hora en la nota y marca «No contestó» para volver a llamar otro día.' },
    { t: 'Si pregunta el precio', s: nueva
      ? 'La página web nueva cuesta S/ 300 en un solo pago, o S/ 89 al mes por 12 meses con dominio, hosting y mantenimiento incluidos. Es precio de lanzamiento hasta el 31 de diciembre y queda lista en 48 horas. Tiene garantía: si no le entregamos lo acordado, le devolvemos el 100%. Por eso primero le mandamos el diseño de prueba gratis, para que vea si le gusta.'
      : 'Depende de lo que haya que corregir; un arreglo como este empieza en S/ 100. Si prefiere una web nueva, cuesta S/ 300 en un solo pago o S/ 89 al mes por 12 meses, todo incluido (precio de lanzamiento hasta el 31 de diciembre). Tiene garantía: si no le entregamos lo acordado, le devolvemos el 100%. Por eso primero le mandamos la versión de prueba gratis.' },
    { t: 'Si pregunta quiénes son', s: 'Somos SV WebStudio, un estudio de diseño web de Lima que trabaja con negocios pequeños y medianos. Puede ver nuestros trabajos en sv-web-studio.vercel.app. Su número lo encontramos en su web o en Páginas Amarillas.' },
    { t: 'Si ya tiene quien le hace la web', s: 'Perfecto. Entonces le recomiendo comentarle este detalle a esa persona, porque le está haciendo perder clientes. Si en algún momento necesita apoyo, con gusto le dejo nuestro WhatsApp.' },
    { t: 'Si no tiene tiempo o pide que le escriban', s: 'Claro, no le quito más tiempo. ¿Le envío por WhatsApp lo que encontramos y la muestra para que la vea cuando pueda? ¿A qué número?' },
    { t: 'Si no le interesa', s: 'Entiendo, muchas gracias por su tiempo. Que tenga un buen día. → Marca «No interesado».' },
  ];
}

export function showPhone(digits) {
  const d = String(digits || '');
  if (/^519\d{8}$/.test(d)) return `${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
  return d.startsWith('51') ? d.slice(2) : d;
}
