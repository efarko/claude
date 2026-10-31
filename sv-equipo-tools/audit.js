// Uso: node audit.js <lote.json> [salida.json]
// Agrega problem/need a cada item (o skip). Si se da salida.json, guarda avance
// tras cada web, así un corte no pierde lo ya auditado (se puede re-ejecutar
// sobre la salida y solo reintenta lo pendiente o lo que "no cargó").
const fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const items = JSON.parse(fs.readFileSync(process.argv[2]));
const out = process.argv[3];
const save = () => { if (out) fs.writeFileSync(out, JSON.stringify(items, null, 1)); };
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1';

let b, ctx;
async function abrir() {
  if (b) await b.close().catch(() => {});
  b = await chromium.launch();
  ctx = await b.newContext({ viewport: { width: 390, height: 844 }, userAgent: UA });
  await ctx.route('**/*', r => ['image', 'media', 'font'].includes(r.request().resourceType()) ? r.abort() : r.continue());
}
const conTope = (pr, ms) => Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error('tope de tiempo')), ms))]);

async function revisar(it) {
  const p = await ctx.newPage();
  try {
    const r = await p.goto(it.web, { timeout: 20000, waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(1500);
    if (!r || r.status() >= 400) { it.problem = 'su página web ya no carga'; it.need = 'nueva'; return; }
    const info = await p.evaluate(() => {
      const as = [...document.querySelectorAll('a')].map(a => a.getAttribute('href') || '');
      const txt = document.body ? document.body.innerText : '';
      const years = (txt.match(/(?:©|copyright)\s*(?:[^0-9]{0,20})(20\d\d)/gi) || []).map(s => +s.match(/20\d\d/)[0]);
      return {
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        viewport: !!document.querySelector('meta[name=viewport]'),
        tel: as.filter(h => /^tel:/i.test(h)),
        wa: as.filter(h => /wa\.me|whatsapp\.com/i.test(h)),
        year: years.length ? Math.max(...years) : 0,
      };
    });
    const badWa = info.wa.find(h => { const m = h.match(/(?:wa\.me\/|phone=)(\d+)/); return m && !/^51\d{9}$/.test(m[1]); });
    if (!info.viewport || info.overflow > 40) { it.problem = 'su web no se adapta al celular: se ve en miniatura o se sale de la pantalla'; it.need = 'nueva'; }
    else if (badWa) { it.problem = 'el botón de whatsapp de su web lleva a un número incompleto y no abre el chat'; it.need = 'arreglo'; }
    else if (!info.tel.length && !info.wa.length) { it.problem = 'en su web el teléfono no se puede tocar para llamar y no hay botón de whatsapp'; it.need = 'arreglo'; }
    else if (info.year && info.year <= 2022) { it.problem = `el pie de su web todavía dice © ${info.year}`; it.need = 'arreglo'; }
    else { it.skip = 'web sin fallo claro'; }
  } finally {
    await p.close().catch(() => {});
  }
}

(async () => {
  await abrir();
  for (const it of items) {
    if (it.problem || (it.skip && !/no cargó/.test(it.skip))) continue;
    delete it.skip;
    if (!it.web) { it.problem = 'no tienen una página web propia'; it.need = 'nueva'; continue; }
    try {
      await conTope(revisar(it), 45000);
    } catch (e) {
      it.skip = 'no cargó desde aquí: ' + e.message.split('\n')[0];
      await abrir(); // navegador colgado o caído: se reinicia para el siguiente
    }
    save();
  }
  await b.close().catch(() => {});
  save();
  if (!out) console.log(JSON.stringify(items, null, 1));
})();
