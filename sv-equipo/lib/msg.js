// Mensajes y guiones. {closer} se reemplaza por el primer nombre de quien envía.
import { firstName } from './auth.js';

const lower = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : '');
const fill = (tpl, p, closer) =>
  tpl.replaceAll('{closer}', closer).replaceAll('{negocio}', p.name).replaceAll('{problema}', lower(p.problem || ''));

function greeting() {
  const h = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Lima', hour: 'numeric', hour12: false }).format(new Date()));
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
}

export function waMessage(p, userName) {
  const closer = firstName(userName);
  if (p.wa_msg) return fill(p.wa_msg, p, closer);
  if (p.need === 'nueva') {
    return fill('Hola, buenas. Soy {closer}, de SV WebStudio. Vimos a {negocio} y notamos que {problema}. Hacemos páginas para negocios de Lima con botón directo a WhatsApp. ¿Les preparamos gratis una muestra de cómo se vería la suya? Sin compromiso.', p, closer);
  }
  return fill('Hola, buenas. Soy {closer}, de SV WebStudio. Entramos a la web de {negocio} desde el celular y vimos que {problema}. Les podemos preparar gratis una muestra de cómo quedaría arreglada, sin compromiso. ¿Se la envío por aquí?', p, closer);
}

export function waLink(p, userName) {
  return `https://wa.me/${p.wa_phone}?text=${encodeURIComponent(waMessage(p, userName))}`;
}

// Guion de llamada en pasos cortos para leer en voz alta.
export function callScript(p, userName) {
  const closer = firstName(userName);
  if (p.call_script) return [{ t: 'Guion', s: fill(p.call_script, p, closer) }];
  const open = `${greeting()}. ¿Hablo con ${p.name}? Soy ${closer}, de SV WebStudio; le robo un minuto.`;
  const hook = p.need === 'nueva'
    ? `Le llamo porque buscamos ${p.name} en internet y vimos que ${lower(p.problem || 'no tiene página web propia')}. Hoy casi todos los clientes buscan en Google antes de llamar.`
    : `Le llamo porque entramos a su web desde el celular y vimos que ${lower(p.problem || 'tiene algunos detalles que hacen perder clientes')}. Cuando pasa eso, muchos clientes se van con la competencia.`;
  const ask = p.need === 'nueva'
    ? 'Hacemos páginas para negocios de Lima, con botón directo a WhatsApp y su ubicación en Google Maps. ¿Le preparamos gratis una muestra de cómo se vería la suya y se la mandamos por WhatsApp? Sin compromiso.'
    : 'Nosotros lo dejamos funcionando rápido. ¿Le preparamos gratis una muestra de cómo quedaría y se la mandamos por WhatsApp? Sin compromiso.';
  return [
    { t: '1. Saluda', s: open },
    { t: '2. El problema', s: hook },
    { t: '3. La propuesta', s: ask },
    { t: 'Si dice que sí', s: '¡Perfecto! ¿A qué número de WhatsApp se la envío y a nombre de quién? → marca «Interesado» y anota el nombre y el número en la nota.' },
    { t: 'Si pregunta el precio', s: 'Los arreglos van desde S/ 100 y una web nueva desde S/ 300 (precio de lanzamiento hasta el 31/12). Si no le gusta el resultado, se le devuelve el 100%. Primero le mandamos la muestra gratis para que la vea.' },
    { t: 'Si dice que no tiene tiempo', s: 'No se preocupe, no le quito más tiempo. ¿Le mando la muestra por WhatsApp y la ve cuando pueda?' },
    { t: 'Si no le interesa', s: 'Entiendo, gracias por su tiempo. Que tenga un buen día. → marca «No interesado».' },
  ];
}

export function showPhone(digits) {
  const d = String(digits || '');
  if (/^519\d{8}$/.test(d)) return `${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
  return d.startsWith('51') ? d.slice(2) : d;
}
