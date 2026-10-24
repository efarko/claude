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
// why: qué le pasa al cliente (llamada) · short: lo mismo en una frase (WhatsApp) · fix: qué hacemos exactamente.
const ISSUES = [
  {
    key: 'caida', re: /ya no abre|ya no muestra|dej[oó] de funcionar|no carga|no existe/i,
    why: 'Hoy, si un cliente busca su página, le aparece un error. Mucha gente piensa que el negocio cerró y llama a otro.',
    short: 'Quien los busca encuentra un error y puede pensar que el negocio cerró.',
  },
  {
    key: 'sinweb', re: /no tiene (una )?p[aá]gina|no tiene web|solo (tiene|aparece)/i,
    why: 'Hoy casi todos buscan en Google antes de llamar. Si no encuentran una página propia, con fotos y datos claros, eligen al negocio que sí la tiene.',
    short: 'Hoy la mayoría busca en Google antes de llamar y elige al negocio que tiene una página propia.',
  },
  {
    key: 'seguro', re: /no segur|certificado/i,
    why: 'Ese aviso de «No seguro» asusta a los clientes: muchos cierran la página antes de ver lo que ofrecen.',
    short: 'Ese aviso hace que muchos clientes cierren la página.',
    fix: 'Le activamos el certificado de seguridad (el candadito al lado de la dirección) para que el navegador deje de mostrar ese aviso.',
  },
  {
    key: 'whatsapp', re: /whatsapp/i,
    why: 'El cliente que quiere escribirles desde la web no puede hacerlo con un toque. Casi nadie se toma el trabajo de copiar el número a mano: se va con otro.',
    short: 'Así, el cliente que quiere escribirles desde la web no puede hacerlo con un toque.',
    fix: 'Dejamos el botón de WhatsApp abriendo directo el chat con ustedes y revisamos que todos los teléfonos de la web funcionen desde el celular.',
  },
  {
    key: 'telefono', re: /tel[eé]fono|n[uú]mero|fijo|marca|conecta|llamar|se toca/i,
    why: 'El cliente que entra desde el celular y toca su número para llamarlos no logra comunicarse, o termina llamando a otro número. Es justo el cliente que ya estaba decidido a contactarlos.',
    short: 'Así, el cliente que los encuentra desde el celular no logra llamarlos con un toque.',
    fix: 'Corregimos los números de la web para que, con un solo toque, la llamada salga directo a ustedes, y agregamos un botón que abre su WhatsApp.',
  },
  {
    key: 'celular', re: /se corta|no se adapta|de lado|se parte|celular|pantalla/i,
    why: 'Hoy casi todos entran desde el celular. Si la web se ve cortada o hay que moverla de lado, la persona la cierra en segundos y busca otra opción.',
    short: 'Desde el celular se ve cortada, y la mayoría de clientes entra por ahí.',
    fix: 'Ajustamos la web para que se vea completa y ordenada en cualquier celular, sin tener que moverla de lado.',
  },
  {
    key: 'desactualizada', re: /©|20\d\d|navidad|a[nñ]os de experiencia|lorem|plantilla|ingl[eé]s|button|no se lee|prueba|aviso/i,
    why: 'Parece un detalle pequeño, pero da la impresión de que la web está abandonada, y el cliente duda de si el negocio sigue atendiendo.',
    short: 'Da la impresión de que la web está descuidada.',
    fix: 'Actualizamos esos textos y datos para que la web se vea al día y transmita confianza.',
  },
];
const FALLBACK = {
  key: 'otro',
  why: 'Esos detalles hacen que los clientes que llegan a su web se vayan sin contactarlos.',
  short: '',
  fix: 'Corregimos esos detalles para que la web funcione bien desde el celular.',
};

export function issueOf(p) {
  return ISSUES.find((i) => i.re.test(p.problem || '')) || (p.need === 'nueva' ? ISSUES[1] : FALLBACK);
}

const isNew = (p, issue) => p.need === 'nueva' || issue.key === 'caida' || issue.key === 'sinweb';

export function waMessage(p, userName) {
  const closer = firstName(userName);
  if (p.wa_msg) return fill(p.wa_msg, p, closer);
  const issue = issueOf(p);
  const short = issue.short ? ` ${issue.short}` : '';
  if (isNew(p, issue)) {
    return fill(`Hola, buenas. Soy {closer}, de SV WebStudio; hacemos páginas web para negocios de Lima. Buscamos a {negocio} en internet y vimos que {problema}.${short} Si quieren, les preparamos gratis un diseño de prueba de su página, con su nombre y sus servicios, para que lo vean en su celular. Sin compromiso. ¿Se lo envío por aquí?`, p, closer);
  }
  return fill(`Hola, buenas. Soy {closer}, de SV WebStudio; hacemos páginas web para negocios de Lima. Revisamos la web de {negocio} desde un celular, como lo haría un cliente, y encontramos un problema: {problema}.${short} Se lo podemos corregir. Si quieren, primero les preparamos gratis una versión de prueba ya corregida para que la vean en su celular, sin compromiso. ¿Se la envío por aquí?`, p, closer);
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
        ? `Nosotros le hacemos una página web profesional a ${p.name}: una página clara con sus servicios, fotos, su ubicación en Google Maps y un botón que abre directo su WhatsApp. Se ve bien en cualquier celular y queda lista en 3 a 5 días hábiles.`
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
      ? 'La página web nueva cuesta S/ 300, precio de lanzamiento hasta el 31 de diciembre; el dominio y el hosting se pagan aparte. Tiene garantía: si no le entregamos lo acordado, le devolvemos el 100%. Por eso primero le mandamos el diseño de prueba gratis, para que vea si le gusta.'
      : 'Depende de lo que haya que corregir; un arreglo como este empieza en S/ 100. Si prefiere una web nueva, cuesta S/ 300 (precio de lanzamiento hasta el 31 de diciembre). Tiene garantía: si no le entregamos lo acordado, le devolvemos el 100%. Por eso primero le mandamos la versión de prueba gratis.' },
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
