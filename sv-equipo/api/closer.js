import { sql, today, log, addDays } from '../lib/db.js';
import { handler, fail, baseUrl } from '../lib/http.js';
import { currentUser } from '../lib/auth.js';
import { prepareDay, moreCalls, callableCount, MAX_NO_ANSWER } from '../lib/assign.js';
import { waLink, waMessage, callScript, showPhone } from '../lib/msg.js';
import { sendMail, ownerEmails } from '../lib/mail.js';

const RESULTS = { interested: 'Interesado', not_interested: 'No interesado', no_answer: 'No contestó' };

const cleanNote = (v) => String(v ?? '').trim().slice(0, 500) || null;
const pid = (v) => { const n = Number(v); if (!Number.isInteger(n) || n <= 0) fail(400, 'Prospecto no válido'); return n; };

async function notifyLead(req, u, p, channel, note) {
  try {
    await sendMail({
      to: await ownerEmails(),
      subject: `[SV Equipo] Interesado: ${p.name} (${u.name})`,
      text: `${u.name} marcó a ${p.name} como INTERESADO por ${channel}.\n\nProblema: ${p.problem || '—'}\nNecesita: ${p.need === 'nueva' ? 'web nueva' : 'arreglo'}\nWhatsApp: ${p.wa_phone ? showPhone(p.wa_phone) : '—'}\nTeléfonos: ${(p.phones || []).map((x) => `${x.label} ${x.show}`).join(' · ') || '—'}\nNota: ${note || '—'}\n\nPanel: ${baseUrl(req)}/panel\n`,
    });
  } catch (e) {
    console.error('lead mail', e);
  }
}

async function currentCall(u) {
  const [p] = await sql`select * from prospects where call_state = 'assigned' and call_user = ${u.id}
                        order by call_seq limit 1`;
  return p;
}

export default handler({
  today: {
    method: 'GET',
    async run({ req }) {
      const u = await currentUser(req);
      await prepareDay(u);
      const day = today();

      const wa = u.can_wa ? await sql`
        select id, name, problem, need, wa_phone, wa_msg, wa_state, wa_result, demo_url from prospects
         where wa_user = ${u.id} and wa_day = ${day} and wa_result is distinct from 'already'
         order by (wa_state = 'done'), (demo_url is not null) desc, priority desc, id` : [];

      let calls = null;
      if (u.can_calls) {
        const cur = await currentCall(u);
        const [{ pending, last }] = await sql`select count(*)::int as pending, max(call_seq % 1000)::int as last from prospects where call_state = 'assigned' and call_user = ${u.id}`;
        const done = await sql`
          select a.prospect_id as id, p.name, a.result, a.note, a.at from activity a join prospects p on p.id = a.prospect_id
           where a.user_id = ${u.id} and a.day = ${day} and a.kind = 'call_result' order by a.at desc`;
        const [ud] = await sql`select call_batches from user_day where user_id = ${u.id} and day = ${day}`;
        const left = pending === 0 ? await callableCount(sql, u, day) : 1;
        calls = {
          batch: ud ? ud.call_batches : 0,
          batchSize: u.call_batch,
          pending,
          pos: cur ? cur.call_seq % 1000 : 0,
          total: last || 0,
          current: cur && {
            id: cur.id, name: cur.name, problem: cur.problem, need: cur.need, attempts: cur.call_attempts,
            phones: cur.phones, dialed: !!cur.call_dialed_at, script: callScript(cur, u.name),
            hasWa: !!cur.wa_phone, waDone: cur.wa_state === 'done',
          },
          done: done.map((d) => ({ ...d, label: RESULTS[d.result] || d.result })),
          canMore: pending === 0 && left > 0,
          poolEmpty: left === 0,
        };
      }

      return {
        user: { name: u.name, role: u.role_label, isOwner: u.is_owner, canWa: u.can_wa, canCalls: u.can_calls, waDaily: u.wa_daily },
        day,
        wa: wa.map((p) => ({
          id: p.id, name: p.name, problem: p.problem, need: p.need, phone: showPhone(p.wa_phone),
          msg: waMessage(p, u.name), link: waLink(p, u.name), sent: p.wa_state === 'done', result: p.wa_result, demo: p.demo_url,
        })),
        calls,
      };
    },
  },

  wa_sent: {
    method: 'POST',
    async run({ req, body, ip }) {
      const u = await currentUser(req);
      const id = pid(body.id);
      const [p] = await sql`update prospects set wa_state = 'done', wa_at = now()
        where id = ${id} and wa_user = ${u.id} and wa_day = ${today()} and wa_state = 'assigned' returning id`;
      if (!p) {
        const [again] = await sql`select 1 from prospects where id = ${id} and wa_user = ${u.id} and wa_state = 'done'`;
        if (!again) fail(409, 'Ese número ya no está en tu lista de hoy.');
        return { ok: true };
      }
      await log(sql, { userId: u.id, kind: 'wa_sent', prospectId: id, ip });
      return { ok: true };
    },
  },

  wa_skip: {
    method: 'POST',
    async run({ req, body, ip }) {
      const u = await currentUser(req);
      const id = pid(body.id);
      const [p] = await sql`update prospects set wa_state = 'done', wa_result = 'already', wa_at = now()
        where id = ${id} and wa_user = ${u.id} and wa_day = ${today()} and wa_state = 'assigned' returning id`;
      if (!p) fail(409, 'Ese número ya no está en tu lista de hoy.');
      await log(sql, { userId: u.id, kind: 'wa_skip', prospectId: id, ip });
      return { ok: true };
    },
  },

  wa_result: {
    method: 'POST',
    async run({ req, body, ip }) {
      const u = await currentUser(req);
      const id = pid(body.id);
      const result = body.result;
      if (!['interested', 'not_interested'].includes(result)) fail(400, 'Resultado no válido');
      const note = cleanNote(body.note);
      const [p] = await sql`
        update prospects set wa_result = ${result},
               interested_at = ${result === 'interested' ? new Date() : null},
               interested_by = ${result === 'interested' ? u.id : null},
               call_state = case when call_state = 'pool' then 'done' else call_state end,
               call_result = case when call_state = 'pool' then ${'wa_' + result} else call_result end,
               note = coalesce(${note}, note)
         where id = ${id} and wa_user = ${u.id} and wa_state = 'done' and wa_result is null
        returning *`;
      if (!p) fail(409, 'Ya marcaste una respuesta para este número.');
      await log(sql, { userId: u.id, kind: 'wa_result', prospectId: id, result, note, ip });
      if (result === 'interested') await notifyLead(req, u, p, 'WhatsApp', note);
      return { ok: true };
    },
  },

  dial: {
    method: 'POST',
    async run({ req, body, ip }) {
      const u = await currentUser(req);
      const id = pid(body.id);
      const cur = await currentCall(u);
      if (!cur || cur.id !== id) fail(409, 'Ese no es tu número actual. Recarga la página.');
      if (!cur.call_dialed_at) {
        await sql`update prospects set call_dialed_at = now() where id = ${id}`;
        await log(sql, { userId: u.id, kind: 'dial', prospectId: id, ip });
      }
      return { ok: true };
    },
  },

  call_result: {
    method: 'POST',
    async run({ req, body, ip }) {
      const u = await currentUser(req);
      const id = pid(body.id);
      const result = body.result;
      if (!RESULTS[result]) fail(400, 'Elige una de las 3 opciones.');
      const note = cleanNote(body.note);
      const cur = await currentCall(u);
      if (!cur || cur.id !== id) fail(409, 'Ese no es tu número actual. Recarga la página.');
      if (!cur.call_dialed_at) fail(409, 'Primero toca «Llamar».');
      const day = today();
      const attempts = cur.call_attempts + 1;

      let p;
      if (result === 'no_answer' && attempts < MAX_NO_ANSWER) {
        // Vuelve al pool y se repite otro día.
        [p] = await sql`update prospects set call_state = 'pool', call_user = null, call_day = null, call_seq = null,
                 call_dialed_at = null, call_attempts = ${attempts}, call_next = ${addDays(day, 1)}, call_result = 'no_answer',
                 call_at = now(), note = coalesce(${note}, note)
               where id = ${id} returning *`;
      } else {
        [p] = await sql`update prospects set call_state = 'done', call_seq = null, call_attempts = ${attempts},
                 call_result = ${result}, call_at = now(), note = coalesce(${note}, note),
                 interested_at = ${result === 'interested' ? new Date() : null},
                 interested_by = ${result === 'interested' ? u.id : null},
                 wa_state = case when wa_state = 'pool' then 'done' else wa_state end,
                 wa_result = case when wa_state = 'pool' then ${'call_' + result} else wa_result end
               where id = ${id} returning *`;
      }
      await log(sql, { userId: u.id, kind: 'call_result', prospectId: id, result, note, ip });
      if (result === 'interested') await notifyLead(req, u, p, 'llamada', note);
      return { ok: true };
    },
  },

  more_calls: {
    method: 'POST',
    async run({ req, ip }) {
      const u = await currentUser(req);
      if (!u.can_calls) fail(403, 'Tu rol no tiene llamadas.');
      const got = await moreCalls(u, ip);
      if (!got) fail(409, 'Termina tu bloque actual primero, o ya no quedan números para hoy.');
      return { ok: true, got };
    },
  },
});
