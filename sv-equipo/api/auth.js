import { sql, log } from '../lib/db.js';
import { handler, fail, cookies, setCookie, baseUrl } from '../lib/http.js';
import { sendMail, ownerEmail, ownerEmails } from '../lib/mail.js';
import {
  newCode, newToken, sha, hashCode, sameHash, normEmail, validEmail, currentUser, SESSION_HOURS,
} from '../lib/auth.js';

const BAD_LOGIN = 'Correo o código incorrecto.';

function maskEmail(e) {
  const [u, d] = e.split('@');
  return `${u.slice(0, 2)}${'•'.repeat(Math.max(1, u.length - 2))}@${d}`;
}

const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export default handler({
  register: {
    method: 'POST',
    async run({ req, body, ip }) {
      const name = clean(body.name, 80);
      const email = normEmail(body.email);
      const phone = clean(body.phone, 20);
      if (name.length < 2) fail(400, 'Escribe tu nombre completo.');
      if (!validEmail(email)) fail(400, 'Ese correo no es válido.');

      const [{ byIp, total }] = await sql`
        select count(*) filter (where ip = ${ip})::int as "byIp", count(*)::int as total
          from activity where kind = 'register' and at > now() - interval '1 hour'`;
      if (byIp >= 3 || total >= 20) fail(429, 'Demasiadas solicitudes. Intenta en una hora.');

      const isOwner = email === ownerEmail();
      const [existing] = await sql`select id, status from users where email = ${email}`;
      if (existing) {
        if (existing.status === 'pending') fail(409, 'Ya tienes una solicitud pendiente. Espera a que Franco la apruebe.');
        if (existing.status === 'active') fail(409, 'Ese correo ya está registrado. Inicia sesión.');
        if (existing.status === 'disabled') fail(403, 'Esa cuenta está desactivada. Habla con Franco.');
      }

      const code = newCode();
      const panel = `${baseUrl(req)}/panel`;
      const notify = isOwner ? null : await ownerEmails();
      await sql.begin(async (tx) => {
        let id;
        if (existing) {
          id = existing.id;
          await tx`update users set name = ${name}, phone = ${phone || null}, status = 'pending', reg_ip = ${ip},
                   created_at = now(), fails = 0, locked_until = null where id = ${id}`;
        } else {
          [{ id }] = await tx`
            insert into users (email, name, phone, role, status, reg_ip, approved_at)
            values (${email}, ${name}, ${phone || null}, ${isOwner ? 'owner' : 'closer'},
                    ${isOwner ? 'active' : 'pending'}, ${ip}, ${isOwner ? new Date() : null})
            returning id`;
        }
        await tx`update users set code_hash = ${hashCode(id, code)}, pending_code = ${isOwner ? null : code} where id = ${id}`;
        await log(tx, { userId: id, kind: 'register', ip });
        if (isOwner) {
          await sendMail({
            to: email,
            subject: `[SV Equipo] Tu código de dueño: ${code}`,
            text: `Hola ${name}:\n\nTu cuenta de dueño ya está activa.\n\nCódigo de acceso: ${code}\n\nGuárdalo: lo vas a usar junto con tu correo cada vez que entres (además te llegará un código nuevo al correo en cada ingreso).\n\nPanel: ${panel}\n`,
          });
        } else {
          await sendMail({
            to: notify,
            subject: `[SV Equipo] Nueva solicitud: ${name}`,
            text: `Nueva solicitud para entrar al equipo:\n\nNombre: ${name}\nCorreo: ${email}\nTeléfono: ${phone || '—'}\n\nCódigo de acceso: ${code}\n\nSi la aceptas:\n1. Apruébala en el panel: ${panel}\n2. Reenvíale este código (o marca «enviarle el código por correo» al aprobar).\n\nSi no la aceptas, recházala en el panel. Sin tu aprobación el código no sirve.\n`,
          });
        }
      });
      return { ok: true, owner: isOwner };
    },
  },

  start: {
    method: 'POST',
    async run({ req, res, body, ip }) {
      const email = normEmail(body.email);
      const code = String(body.code ?? '').replace(/\D/g, '');
      if (!validEmail(email) || code.length !== 6) fail(400, BAD_LOGIN);

      const [u] = await sql`select id, name, status, code_hash, fails, locked_until from users where email = ${email}`;
      if (!u || !u.code_hash || u.status === 'rejected') fail(401, BAD_LOGIN);
      if (u.locked_until && u.locked_until > new Date()) fail(429, 'Demasiados intentos. Espera 15 minutos.');

      if (!sameHash(hashCode(u.id, code), u.code_hash)) {
        const fails = u.fails + 1;
        await sql`update users set fails = ${fails >= 5 ? 0 : fails},
                  locked_until = ${fails >= 5 ? new Date(Date.now() + 15 * 60e3) : null} where id = ${u.id}`;
        await log(sql, { userId: u.id, kind: 'login_fail', ip });
        if (fails >= 5) fail(429, 'Demasiados intentos. Espera 15 minutos.');
        fail(401, BAD_LOGIN);
      }
      if (u.status === 'pending') fail(403, 'Tu solicitud todavía no fue aprobada. Franco te avisará.');
      if (u.status === 'disabled') fail(403, 'Tu cuenta está desactivada. Habla con Franco.');

      const [{ sent }] = await sql`select count(*)::int as sent from activity
        where user_id = ${u.id} and kind = 'otp_sent' and at > now() - interval '15 minutes'`;
      if (sent >= 5) fail(429, 'Ya te enviamos varios códigos. Espera unos minutos.');

      const otp = newCode();
      const ticket = newToken();
      await sql`delete from otps where user_id = ${u.id} or expires_at < now()`;
      await sql`insert into otps (ticket_hash, user_id, code_hash, expires_at)
                values (${sha(ticket)}, ${u.id}, ${hashCode(u.id, 'otp:' + otp)}, now() + interval '10 minutes')`;
      await sendMail({
        to: email,
        subject: `Tu código de ingreso: ${otp}`,
        text: `Hola ${u.name}:\n\nTu código para entrar a SV Equipo es: ${otp}\n\nVence en 10 minutos. Si no fuiste tú, avísale a Franco.\n`,
      });
      await sql`update users set fails = 0 where id = ${u.id}`;
      await log(sql, { userId: u.id, kind: 'otp_sent', ip });
      setCookie(req, res, 'sv_t', ticket, 600);
      return { ok: true, to: maskEmail(email) };
    },
  },

  verify: {
    method: 'POST',
    async run({ req, res, body, ip }) {
      const ticket = cookies(req).sv_t;
      const otp = String(body.otp ?? '').replace(/\D/g, '');
      if (!ticket) fail(400, 'El código venció. Vuelve a ingresar tu correo.');
      const [o] = await sql`select o.*, u.status, r.is_owner from otps o
        join users u on u.id = o.user_id join roles r on r.name = u.role
        where o.ticket_hash = ${sha(ticket)}`;
      if (!o || o.expires_at < new Date() || o.status !== 'active') fail(400, 'El código venció. Vuelve a ingresar tu correo.');
      if (o.attempts >= 5) {
        await sql`delete from otps where ticket_hash = ${o.ticket_hash}`;
        fail(429, 'Demasiados intentos. Vuelve a ingresar tu correo.');
      }
      if (otp.length !== 6 || !sameHash(hashCode(o.user_id, 'otp:' + otp), o.code_hash)) {
        await sql`update otps set attempts = attempts + 1 where ticket_hash = ${o.ticket_hash}`;
        await log(sql, { userId: o.user_id, kind: 'otp_fail', ip });
        fail(401, 'Código incorrecto. Revisa el último correo que te llegó.');
      }
      const token = newToken();
      await sql.begin(async (tx) => {
        await tx`delete from otps where ticket_hash = ${o.ticket_hash}`;
        await tx`delete from sessions where expires_at < now()`;
        await tx`insert into sessions (token_hash, user_id, expires_at)
                 values (${sha(token)}, ${o.user_id}, now() + ${SESSION_HOURS + ' hours'}::interval)`;
        await tx`update users set last_login = now() where id = ${o.user_id}`;
        await log(tx, { userId: o.user_id, kind: 'login', ip });
      });
      setCookie(req, res, 'sv_s', token, SESSION_HOURS * 3600);
      setCookie(req, res, 'sv_t', '', 0);
      return { ok: true, next: o.is_owner ? '/panel' : '/app' };
    },
  },

  logout: {
    method: 'POST',
    async run({ req, res }) {
      const token = cookies(req).sv_s;
      if (token) await sql`delete from sessions where token_hash = ${sha(token)}`;
      setCookie(req, res, 'sv_s', '', 0);
      return { ok: true };
    },
  },

  me: {
    method: 'GET',
    async run({ req }) {
      const u = await currentUser(req);
      return { user: { name: u.name, email: u.email, role: u.role_label, isOwner: u.is_owner, canWa: u.can_wa, canCalls: u.can_calls } };
    },
  },
});
