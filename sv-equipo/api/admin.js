import { sql, today, log } from '../lib/db.js';
import { handler, fail, baseUrl } from '../lib/http.js';
import { currentUser, newCode, hashCode } from '../lib/auth.js';
import { sendMail, ownerEmail } from '../lib/mail.js';
import { poolCounts, releaseStale, LOW_POOL } from '../lib/assign.js';
import { normalize } from '../lib/import.js';
import { showPhone } from '../lib/msg.js';

const owner = (req) => currentUser(req, { owner: true });
const intId = (v) => { const n = Number(v); if (!Number.isInteger(n) || n <= 0) fail(400, 'Id no válido'); return n; };
const validDay = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d || '') ? d : today());

// Resumen por usuario para un día.
async function perUser(day) {
  return sql`
    select u.id, u.name, u.email, u.role, u.status,
      count(a.*) filter (where a.kind = 'wa_sent')::int as wa,
      count(a.*) filter (where a.kind = 'call_result')::int as calls,
      count(a.*) filter (where a.kind = 'call_result' and a.result = 'no_answer')::int as no_answer,
      count(a.*) filter (where a.kind = 'call_result' and a.result = 'not_interested')::int as not_interested,
      count(a.*) filter (where a.kind in ('call_result','wa_result') and a.result = 'interested')::int as interested,
      min(a.at) filter (where a.kind in ('wa_sent','call_result')) as first_at,
      max(a.at) filter (where a.kind in ('wa_sent','call_result')) as last_at
    from users u
    left join activity a on a.user_id = u.id and a.day = ${day}
    where u.status = 'active'
    group by u.id order by u.name`;
}

async function releaseUser(tx, userId) {
  await tx`update prospects set wa_state = 'pool', wa_user = null, wa_day = null where wa_state = 'assigned' and wa_user = ${userId}`;
  await tx`update prospects set call_state = 'pool', call_user = null, call_day = null, call_seq = null, call_dialed_at = null
           where call_state = 'assigned' and call_user = ${userId}`;
  await tx`update prospects set owner_id = null where owner_id = ${userId}
           and wa_state in ('none','pool') and call_state in ('none','pool')`;
}

export default handler({
  overview: {
    method: 'GET',
    async run({ req }) {
      const me = await owner(req);
      const day = today();
      await sql.begin(async (tx) => { await tx`select pg_advisory_xact_lock(727002)`; await releaseStale(tx, day); });
      const pool = await poolCounts(sql, day);
      const [totals] = await sql`
        select count(*)::int as total,
               count(*) filter (where interested_at is not null)::int as interested,
               count(*) filter (where status = 'blocked')::int as blocked,
               count(*) filter (where status = 'client')::int as clients
          from prospects`;
      const [{ pending }] = await sql`select count(*)::int as pending from users where status = 'pending'`;
      const week = await sql`
        select day::text, count(*) filter (where kind = 'wa_sent')::int as wa,
               count(*) filter (where kind = 'call_result')::int as calls,
               count(*) filter (where kind in ('call_result','wa_result') and result = 'interested')::int as interested
          from activity where day > ${day}::date - 7 group by day order by day`;
      return { me: { name: me.name }, day, pool, low: pool.wa <= LOW_POOL || pool.calls <= LOW_POOL, lowLimit: LOW_POOL, totals, pending, team: await perUser(day), week };
    },
  },

  users: {
    method: 'GET',
    async run({ req }) {
      await owner(req);
      const users = await sql`
        select u.id, u.name, u.email, u.phone, u.role, r.label as role_label, r.is_owner, u.status,
               u.created_at, u.approved_at, u.last_login, (u.pending_code is not null) as has_pending_code,
               (u.locked_until is not null and u.locked_until > now()) as locked
          from users u join roles r on r.name = u.role
         order by case u.status when 'pending' then 0 when 'active' then 1 else 2 end, u.created_at desc`;
      const roles = await sql`select r.*, (select count(*)::int from users u where u.role = r.name) as users from roles r order by is_owner desc, created_at`;
      return { users, roles };
    },
  },

  user: {
    method: 'POST',
    async run({ req, body, ip }) {
      const me = await owner(req);
      const id = intId(body.id);
      const [u] = await sql`select u.*, r.is_owner from users u join roles r on r.name = u.role where u.id = ${id}`;
      if (!u) fail(404, 'Usuario no encontrado');
      const op = body.op;
      if (u.is_owner && op !== 'code') fail(400, 'No puedes cambiar la cuenta del dueño.');
      const login = `${baseUrl(req)}/`;
      let out = { ok: true };

      if (op === 'approve') {
        if (u.status !== 'pending') fail(409, 'Esta solicitud ya fue atendida.');
        let code = u.pending_code;
        if (!code) { code = newCode(); await sql`update users set code_hash = ${hashCode(id, code)} where id = ${id}`; }
        if (body.send) {
          await sendMail({
            to: u.email,
            subject: '[SV Equipo] ¡Bienvenido! Tu código de acceso',
            text: `Hola ${u.name}:\n\nFranco aprobó tu ingreso al equipo de SV WebStudio.\n\nTu código de acceso: ${code}\n\nEntra en ${login} con tu correo y este código. Cada vez que entres te llegará además un código nuevo a este correo para confirmar que eres tú.\n\nNo compartas tu código con nadie.\n`,
          });
        }
        await sql`update users set status = 'active', approved_at = now(), pending_code = null where id = ${id}`;
        out = { ok: true, code: body.send ? null : code };
      } else if (op === 'reject') {
        if (u.status !== 'pending') fail(409, 'Esta solicitud ya fue atendida.');
        await sql`update users set status = 'rejected', pending_code = null, code_hash = null where id = ${id}`;
      } else if (op === 'disable') {
        await sql.begin(async (tx) => {
          await tx`select pg_advisory_xact_lock(727002)`;
          await tx`update users set status = 'disabled' where id = ${id}`;
          await tx`delete from sessions where user_id = ${id}`;
          await releaseUser(tx, id);
        });
      } else if (op === 'enable') {
        if (u.status !== 'disabled') fail(409, 'La cuenta no está desactivada.');
        await sql`update users set status = 'active', fails = 0, locked_until = null where id = ${id}`;
      } else if (op === 'role') {
        const [r] = await sql`select * from roles where name = ${String(body.role || '')}`;
        if (!r || r.is_owner) fail(400, 'Rol no válido');
        await sql`update users set role = ${r.name} where id = ${id}`;
      } else if (op === 'code') {
        if (u.status !== 'active' && u.status !== 'pending') fail(409, 'Activa la cuenta primero.');
        const code = newCode();
        await sql`update users set code_hash = ${hashCode(id, code)}, pending_code = ${u.status === 'pending' ? code : null},
                  fails = 0, locked_until = null where id = ${id}`;
        await sql`delete from sessions where user_id = ${id} and ${id} <> ${me.id}`;
        if (body.send) {
          await sendMail({ to: u.email, subject: '[SV Equipo] Tu nuevo código de acceso', text: `Hola ${u.name}:\n\nTu nuevo código de acceso es: ${code}\n\nEl anterior ya no sirve. Entra en ${login}\n` });
        }
        out = { ok: true, code: body.send ? null : code };
      } else {
        fail(400, 'Operación no válida');
      }
      await log(sql, { userId: me.id, kind: `user_${op}`, note: `${u.name} <${u.email}>${op === 'role' ? ' → ' + body.role : ''}`, ip });
      return out;
    },
  },

  role_save: {
    method: 'POST',
    async run({ req, body, ip }) {
      const me = await owner(req);
      const label = String(body.label || '').trim().slice(0, 40);
      const name = String(body.name || label).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 30);
      if (label.length < 2 || name.length < 2) fail(400, 'Escribe un nombre para el rol.');
      const num = (v, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(0, Math.min(200, n)) : d; };
      const canWa = !!body.can_wa;
      const canCalls = !!body.can_calls;
      if (!canWa && !canCalls) fail(400, 'El rol necesita WhatsApp, llamadas o ambos.');
      const [cur] = await sql`select is_owner from roles where name = ${name}`;
      if (cur?.is_owner) fail(400, 'El rol de dueño no se puede editar.');
      await sql`insert into roles (name, label, can_wa, can_calls, wa_daily, call_batch)
                values (${name}, ${label}, ${canWa}, ${canCalls}, ${num(body.wa_daily, 15)}, ${num(body.call_batch, 20)})
                on conflict (name) do update set label = excluded.label, can_wa = excluded.can_wa, can_calls = excluded.can_calls,
                  wa_daily = excluded.wa_daily, call_batch = excluded.call_batch`;
      await log(sql, { userId: me.id, kind: cur ? 'role_edit' : 'role_create', note: label, ip });
      return { ok: true, name };
    },
  },

  role_delete: {
    method: 'POST',
    async run({ req, body, ip }) {
      const me = await owner(req);
      const name = String(body.name || '');
      if (name === 'owner' || name === 'closer') fail(400, 'Ese rol no se puede borrar.');
      const [{ n }] = await sql`select count(*)::int as n from users where role = ${name}`;
      if (n) fail(409, 'Primero cambia de rol a los usuarios que lo tienen.');
      await sql`delete from roles where name = ${name}`;
      await log(sql, { userId: me.id, kind: 'role_delete', note: name, ip });
      return { ok: true };
    },
  },

  import: {
    method: 'POST',
    async run({ req, body, ip }) {
      const me = await owner(req);
      const items = Array.isArray(body) ? body : Array.isArray(body.items) ? body.items : body.prospects;
      if (!Array.isArray(items) || !items.length) fail(400, 'No encontré prospectos en el archivo.');
      if (items.length > 3000) fail(400, 'Máximo 3000 prospectos por vez.');
      const errors = [];
      const rows = [];
      const seen = new Set();
      for (const raw of items) {
        const { row, error } = normalize(raw || {});
        if (error) { errors.push(error); continue; }
        if (seen.has(row.name_key) || (row.wa_phone && seen.has(row.wa_phone))) { continue; }
        seen.add(row.name_key);
        if (row.wa_phone) seen.add(row.wa_phone);
        rows.push(row);
      }
      let added = 0;
      for (let i = 0; i < rows.length; i += 200) {
        const chunk = rows.slice(i, i + 200).map((r) => ({ ...r, phones: JSON.stringify(r.phones) }));
        const res = await sql`insert into prospects ${sql(chunk, 'name', 'name_key', 'category', 'district', 'web', 'problem', 'need', 'priority',
          'wa_phone', 'wa_msg', 'phones', 'call_script', 'wa_state', 'call_state', 'source')} on conflict do nothing returning id`;
        added += res.length;
      }
      // phones llega como texto: lo convierto a jsonb real.
      await sql`update prospects set phones = (phones #>> '{}')::jsonb where jsonb_typeof(phones) = 'string'`;
      const skipped = rows.length - added;
      await log(sql, { userId: me.id, kind: 'import', result: String(added), note: `${added} nuevos, ${skipped} repetidos, ${errors.length} con error`, ip });
      return { ok: true, added, skipped, errors: errors.slice(0, 30), invalid: errors.length, pool: await poolCounts(sql) };
    },
  },

  request_more: {
    method: 'POST',
    async run({ req, body, ip }) {
      const me = await owner(req);
      const amount = Math.max(10, Math.min(300, Math.round(Number(body.amount) || 60)));
      const pool = await poolCounts(sql);
      const names = await sql`select name from prospects order by id`;
      await sendMail({
        to: ownerEmail(),
        subject: `[SV Equipo] Pedido de prospectos: ${amount} nuevos`,
        text: `Pedido desde el panel (${new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })}).\n\nQuedan: WhatsApp ${pool.wa} · llamadas ${pool.calls} (${pool.calls_later} para otro día).\nSe piden: ${amount} negocios nuevos de Lima con fallas en su web o sin web.${body.notes ? `\nIndicaciones: ${String(body.notes).slice(0, 500)}` : ''}\n\nFormato: JSON para «Importar» del panel → [{"name","problem","need":"arreglo|nueva","wa":"9XXXXXXXX","phones":[{"label","tel"}],"category","district","web"}]\n\nYa están en el sistema (no repetir): ${names.map((n) => n.name).join(' · ')}\n`,
      });
      await log(sql, { userId: me.id, kind: 'request_more', result: String(amount), ip });
      return { ok: true };
    },
  },

  activity: {
    method: 'GET',
    async run({ req, q }) {
      await owner(req);
      const day = validDay(q.day);
      const uid = q.user ? intId(q.user) : null;
      const rows = await sql`
        select a.id, a.at, a.kind, a.result, a.note, a.ip, u.name as user_name, a.user_id, p.name as prospect, a.prospect_id
          from activity a left join users u on u.id = a.user_id left join prospects p on p.id = a.prospect_id
         where a.day = ${day} ${uid ? sql`and a.user_id = ${uid}` : sql``}
         order by a.at desc limit 1000`;
      return { day, rows, team: await perUser(day) };
    },
  },

  leads: {
    method: 'GET',
    async run({ req }) {
      await owner(req);
      const rows = await sql`
        select p.id, p.name, p.problem, p.need, p.wa_phone, p.phones, p.note, p.interested_at, p.status, u.name as by_name,
               case when p.call_result = 'interested' then 'Llamada' else 'WhatsApp' end as channel
          from prospects p left join users u on u.id = p.interested_by
         where p.interested_at is not null order by p.interested_at desc limit 300`;
      return { rows: rows.map((r) => ({ ...r, wa: r.wa_phone ? showPhone(r.wa_phone) : null })) };
    },
  },

  prospects: {
    method: 'GET',
    async run({ req, q }) {
      await owner(req);
      const term = String(q.q || '').trim().slice(0, 60);
      const like = `%${term.replace(/[%_\\]/g, '\\$&')}%`;
      const rows = await sql`
        select p.id, p.name, p.problem, p.need, p.wa_phone, p.phones, p.status, p.wa_state, p.wa_result, p.call_state, p.call_result,
               p.call_attempts, p.call_next::text, p.interested_at, p.note, o.name as owner_name
          from prospects p left join users o on o.id = p.owner_id
         where ${term ? sql`(p.name ilike ${like} or p.wa_phone like ${like} or p.phones::text like ${like})` : sql`true`}
         order by p.id desc limit 100`;
      return { rows: rows.map((r) => ({ ...r, wa: r.wa_phone ? showPhone(r.wa_phone) : null })) };
    },
  },

  prospect: {
    method: 'POST',
    async run({ req, body, ip }) {
      const me = await owner(req);
      const id = intId(body.id);
      const op = body.op;
      let r;
      if (op === 'block' || op === 'client') {
        [r] = await sql`update prospects set status = ${op === 'block' ? 'blocked' : 'client'},
                  wa_state = case when wa_state in ('pool','assigned') then 'none' else wa_state end,
                  call_state = case when call_state in ('pool','assigned') then 'none' else call_state end,
                  wa_user = case when wa_state = 'assigned' then null else wa_user end,
                  call_user = case when call_state = 'assigned' then null else call_user end
                where id = ${id} returning name`;
      } else if (op === 'unblock') {
        [r] = await sql`update prospects set status = 'active',
                  wa_state = case when wa_state = 'none' and wa_phone is not null then 'pool' else wa_state end,
                  call_state = case when call_state = 'none' and jsonb_array_length(phones) > 0 then 'pool' else call_state end
                where id = ${id} returning name`;
      } else {
        fail(400, 'Operación no válida');
      }
      if (!r) fail(404, 'Prospecto no encontrado');
      await log(sql, { userId: me.id, kind: `prospect_${op}`, prospectId: id, note: r.name, ip });
      return { ok: true };
    },
  },
});
