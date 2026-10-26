// Entrada para las rutinas automáticas de Claude. Se autentica con BOT_TOKEN (cabecera Authorization: Bearer ...).
import { sql, log } from '../lib/db.js';
import { handler, fail } from '../lib/http.js';
import { sha, sameHash, normEmail } from '../lib/auth.js';
import { poolCounts } from '../lib/assign.js';
import { importItems } from '../lib/import.js';

function bot(req) {
  const token = process.env.BOT_TOKEN;
  const got = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !got || !sameHash(sha(got), sha(token))) fail(401, 'Token no válido');
}

export default handler({
  // Cuántos quedan para el equipo y qué negocios ya existen (para no repetirlos).
  status: {
    method: 'GET',
    async run({ req }) {
      bot(req);
      const names = await sql`select name from prospects order by id`;
      return { pool: await poolCounts(sql), names: names.map((n) => n.name) };
    },
  },

  // Igual que «Importar» del panel. Con reserve_email, los prospectos quedan solo para esa persona y salen primero.
  import: {
    method: 'POST',
    async run({ req, body, ip }) {
      bot(req);
      const items = body.items;
      if (!Array.isArray(items) || !items.length) fail(400, 'Falta items');
      if (items.length > 200) fail(400, 'Máximo 200 por vez');
      let extra = {};
      if (body.reserve_email) {
        const [u] = await sql`select id from users where email = ${normEmail(body.reserve_email)} and status = 'active'`;
        if (!u) fail(400, 'reserve_email no es un usuario activo');
        extra = { reserved_for: u.id, priority: 10 };
      }
      const { added, skipped, errors } = await importItems(items, extra);
      await log(sql, { kind: 'bot_import', result: String(added), note: `${added} nuevos, ${skipped} repetidos, ${errors.length} con error${extra.reserved_for ? ' (reservados)' : ''}`, ip });
      return { ok: true, added, skipped, errors: errors.slice(0, 30), pool: await poolCounts(sql) };
    },
  },
});
