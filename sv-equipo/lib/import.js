// Normaliza la lista que se pega o sube en el panel antes de guardarla.
import { showPhone } from './msg.js';
import { sql } from './db.js';

const str = (v, max) => {
  const s = String(v ?? '').replace(/\s+/g, ' ').trim();
  return s ? s.slice(0, max) : null;
};

export function nameKey(name) {
  return String(name).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

// Celular para wa.me: 51 + 9 dígitos que empiezan con 9.
export function waDigits(v) {
  let d = String(v ?? '').replace(/\D/g, '');
  if (d.length === 9 && d.startsWith('9')) d = '51' + d;
  return /^519\d{8}$/.test(d) ? d : null;
}

// Teléfono para tel:. Acepta celulares y fijos de Lima con o sin 01.
export function telDigits(v) {
  let d = String(v ?? '').replace(/\D/g, '');
  if (d.length === 9 && d.startsWith('9')) d = '51' + d;
  else if (d.length === 9 && d.startsWith('01')) d = '511' + d.slice(2);
  else if (d.length === 7) d = '511' + d;
  else if (d.length === 8 && d.startsWith('0')) d = '51' + d.slice(1);
  if (/^519\d{8}$/.test(d) || /^51[1-8]\d{6,7}$/.test(d)) return d;
  return null;
}

function showTel(d) {
  if (d.startsWith('519')) return showPhone(d);
  if (d.startsWith('511')) return `(01) ${d.slice(3, 6)}-${d.slice(6)}`;
  return `(0${d.slice(2, 4)}) ${d.slice(4)}`;
}

export function normalize(raw) {
  const name = str(raw.name ?? raw.nombre, 120);
  if (!name) return { error: 'sin nombre' };
  const wa = waDigits(raw.wa ?? raw.whatsapp ?? raw.cel);
  const list = Array.isArray(raw.phones) ? raw.phones : [raw.tel, raw.fijo, raw.telefono].filter(Boolean).map((t) => ({ tel: t }));
  const phones = [];
  for (const ph of list) {
    const d = telDigits(typeof ph === 'string' ? ph : ph.tel ?? ph.show);
    if (!d || phones.some((x) => x.tel === '+' + d)) continue;
    phones.push({ label: str(ph.label, 20) || (d.startsWith('519') ? 'Celular' : 'Fijo'), show: showTel(d), tel: '+' + d });
  }
  if (!phones.length && wa) phones.push({ label: 'Celular', show: showPhone(wa), tel: '+' + wa });
  if (!wa && !phones.length) return { error: `${name}: sin teléfono válido` };
  const need = ['arreglo', 'nueva'].includes(raw.need ?? raw.type) ? (raw.need ?? raw.type) : 'arreglo';
  const prio = Number(raw.priority ?? 0);
  const demo = str(raw.demo ?? raw.muestra, 200);
  return {
    row: {
      name,
      name_key: nameKey(name),
      category: str(raw.category ?? raw.rubro, 60),
      district: str(raw.district ?? raw.distrito, 60),
      web: str(raw.web, 200),
      problem: str(raw.problem ?? raw.problema, 300),
      need,
      priority: Number.isFinite(prio) ? Math.max(0, Math.min(10, Math.round(prio))) : 0,
      wa_phone: wa,
      wa_msg: str(raw.msg ?? raw.mensaje, 1000),
      phones,
      call_script: str(raw.script ?? raw.guion, 2000),
      wa_state: wa ? 'pool' : 'none',
      call_state: phones.length ? 'pool' : 'none',
      source: str(raw.source, 60),
      demo_url: demo && /^https:\/\/[^\s]+$/.test(demo) ? demo : null,
    },
  };
}

// Guarda prospectos ya normalizados. extra se aplica a todas las filas (ej. reserved_for).
export async function importItems(items, extra = {}) {
  const errors = [];
  const rows = [];
  const seen = new Set();
  for (const raw of items) {
    const { row, error } = normalize(raw || {});
    if (error) { errors.push(error); continue; }
    if (seen.has(row.name_key) || (row.wa_phone && seen.has(row.wa_phone))) continue;
    seen.add(row.name_key);
    if (row.wa_phone) seen.add(row.wa_phone);
    rows.push({ ...row, reserved_for: null, ...extra });
  }
  let added = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200).map((r) => ({ ...r, phones: JSON.stringify(r.phones) }));
    const res = await sql`insert into prospects ${sql(chunk, 'name', 'name_key', 'category', 'district', 'web', 'problem', 'need', 'priority',
      'wa_phone', 'wa_msg', 'phones', 'call_script', 'wa_state', 'call_state', 'source', 'demo_url', 'reserved_for')} on conflict do nothing returning id`;
    added += res.length;
  }
  // phones llega como texto: lo convierto a jsonb real.
  await sql`update prospects set phones = (phones #>> '{}')::jsonb where jsonb_typeof(phones) = 'string'`;
  return { added, skipped: rows.length - added, errors };
}
