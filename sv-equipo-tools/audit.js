// Uso: node audit.js <lote.json>  -> agrega problem/need a cada item (o skip)
const fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const items = JSON.parse(fs.readFileSync(process.argv[2]));
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1' });
  await ctx.route('**/*', r => ['image', 'media', 'font'].includes(r.request().resourceType()) ? r.abort() : r.continue());
  for (const it of items) {
    if (it.problem || (it.skip && !/no cargó/.test(it.skip))) continue;
    delete it.skip;
    const p = await ctx.newPage();
    if (!it.web) { it.problem = 'no tienen una página web propia'; it.need = 'nueva'; continue; }
    try {
      const r = await p.goto(it.web, { timeout: 20000, waitUntil: 'domcontentloaded' });
      await p.waitForTimeout(1500);
      if (!r || r.status() >= 400) { it.problem = 'su página web ya no carga'; it.need = 'nueva'; await p.close(); continue; }
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
    } catch (e) { it.skip = 'no cargó desde aquí: ' + e.message.split('\n')[0]; }
    await p.close().catch(()=>{});
  }
  await b.close();
  console.log(JSON.stringify(items, null, 1));
})();
