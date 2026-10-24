// Reparto de prospectos. Todo corre bajo un candado global para que dos usuarios nunca reciban el mismo número.
import { sql, today, log } from './db.js';
import { sendMail, ownerEmails } from './mail.js';

const LOCK = 727002;
export const LOW_POOL = 15;
export const MAX_NO_ANSWER = 3;

// Devuelve al pool lo que quedó sin hacer en días anteriores.
export async function releaseStale(tx, day) {
  await tx`update prospects set wa_state = 'pool', wa_user = null, wa_day = null
           where wa_state = 'assigned' and wa_day < ${day}`;
  await tx`update prospects set call_state = 'pool', call_user = null, call_day = null, call_seq = null, call_dialed_at = null
           where call_state = 'assigned' and call_day < ${day}`;
  // Un negocio deja de "pertenecer" a un closer si este nunca llegó a contactarlo.
  await tx`update prospects set owner_id = null
           where owner_id is not null and wa_state in ('none','pool') and call_state in ('none','pool') and call_attempts = 0`;
}

// Disponibles para cada canal hoy (sin contar los reservados a otro closer).
export async function poolCounts(db, day = today()) {
  const [c] = await db`
    select count(*) filter (where wa_state = 'pool')::int as wa,
           count(*) filter (where call_state = 'pool' and (call_next is null or call_next <= ${day}))::int as calls,
           count(*) filter (where call_state = 'pool' and call_next > ${day})::int as calls_later
      from prospects where status = 'active'`;
  return c;
}

async function assignWa(tx, u, day) {
  const [{ have }] = await tx`select count(*)::int as have from prospects
    where wa_user = ${u.id} and wa_day = ${day} and wa_result is distinct from 'already'`;
  const need = u.wa_daily - have;
  if (need <= 0) return 0;
  const rows = await tx`
    with picked as (
      select id from prospects
       where status = 'active' and wa_state = 'pool'
         and (owner_id is null or owner_id = ${u.id})
         and not (call_state = 'assigned' or (call_state = 'done' and call_day = ${day}))
       order by (owner_id = ${u.id}) desc nulls last, priority desc, id
       limit ${need})
    update prospects p set wa_state = 'assigned', wa_user = ${u.id}, wa_day = ${day}, owner_id = coalesce(p.owner_id, ${u.id})
      from picked where p.id = picked.id
    returning p.id`;
  return rows.length;
}

// Números que este usuario podría llamar hoy.
const callableFor = (db, u, day) => db`
       where status = 'active' and call_state = 'pool'
         and (call_next is null or call_next <= ${day})
         and (owner_id is null or owner_id = ${u.id})
         and not (wa_state = 'assigned' or (wa_state = 'done' and wa_day = ${day}))`;

export async function callableCount(db, u, day) {
  const [{ n }] = await db`select count(*)::int as n from prospects ${callableFor(db, u, day)}`;
  return n;
}

async function assignCalls(tx, u, day, batch) {
  const rows = await tx`
    with picked as (
      select id, row_number() over (order by (owner_id = ${u.id}) desc nulls last, call_attempts desc, priority desc, id) as rn
        from prospects
         ${callableFor(tx, u, day)}
       order by rn
       limit ${u.call_batch})
    update prospects p set call_state = 'assigned', call_user = ${u.id}, call_day = ${day},
           call_seq = ${batch * 1000} + picked.rn, call_dialed_at = null, owner_id = coalesce(p.owner_id, ${u.id})
      from picked where p.id = picked.id
    returning p.id`;
  return rows.length;
}

async function pendingCalls(tx, u) {
  const [{ n }] = await tx`select count(*)::int as n from prospects where call_state = 'assigned' and call_user = ${u.id}`;
  return n;
}

async function batches(tx, u, day) {
  const [r] = await tx`select call_batches from user_day where user_id = ${u.id} and day = ${day}`;
  return r ? r.call_batches : 0;
}

async function bumpBatch(tx, u, day) {
  await tx`insert into user_day (user_id, day, call_batches) values (${u.id}, ${day}, 1)
           on conflict (user_id, day) do update set call_batches = user_day.call_batches + 1`;
}

// Prepara el día del closer: completa sus WhatsApp y le da su primer bloque de llamadas.
export async function prepareDay(u) {
  const day = today();
  await sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(${LOCK})`;
    await releaseStale(tx, day);
    if (u.can_wa) await assignWa(tx, u, day);
    if (u.can_calls && (await batches(tx, u, day)) === 0 && (await pendingCalls(tx, u)) === 0) {
      const got = await assignCalls(tx, u, day, 1);
      if (got > 0) await bumpBatch(tx, u, day);
    }
  });
  await maybeLowAlert(day);
}

// "Generar 20 más": solo si ya terminó el bloque actual.
export async function moreCalls(u, ip) {
  const day = today();
  let got = 0;
  await sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(${LOCK})`;
    await releaseStale(tx, day);
    if ((await pendingCalls(tx, u)) > 0) return;
    const b = await batches(tx, u, day);
    got = await assignCalls(tx, u, day, b + 1);
    if (got > 0) {
      await bumpBatch(tx, u, day);
      await log(tx, { userId: u.id, kind: 'more_calls', result: String(got), ip });
    }
  });
  await maybeLowAlert(day);
  return got;
}

// Avisa a Franco por correo (una vez al día) cuando quedan pocos prospectos.
async function maybeLowAlert(day) {
  const c = await poolCounts(sql, day);
  if (c.wa > LOW_POOL && c.calls > LOW_POOL) return;
  const [ins] = await sql`insert into meta (k, v) values ('low_alert', ${day})
                          on conflict (k) do update set v = excluded.v where meta.v <> excluded.v returning k`;
  if (!ins) return;
  try {
    await sendMail({
      to: await ownerEmails(),
      subject: `[SV Equipo] Quedan pocos prospectos (WhatsApp ${c.wa} · llamadas ${c.calls})`,
      text: `Quedan ${c.wa} prospectos para WhatsApp y ${c.calls} para llamar hoy (${c.calls_later} esperan para otro día).\n\nEntra al panel → Prospectos → «Generar más» o «Importar».\n`,
    });
  } catch (e) {
    console.error('low alert', e);
  }
}
