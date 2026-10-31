// Uso: node gmaps.js "<busqueda 1>" "<busqueda 2>" ...  -> JSON de negocios leídos de la lista de resultados de Google Maps
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const queries = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ locale: 'es-PE', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36' });
  const p = await ctx.newPage();
  const out = [], seen = new Set();
  for (const q of queries) {
    try {
      await p.goto('https://www.google.com/maps/search/' + encodeURIComponent(q) + '?hl=es', { timeout: 45000, waitUntil: 'domcontentloaded' });
      await p.waitForTimeout(4000);
      let prev = 0;
      for (let i = 0; i < 12; i++) {
        await p.evaluate(() => { const f = document.querySelector('div[role="feed"]'); if (f) f.scrollBy(0, 4000); });
        await p.waitForTimeout(1600);
        const n = await p.$$eval('div[role="feed"] div[role="article"]', a => a.length);
        const end = await p.evaluate(() => /llegaste al final de la lista|You've reached the end/i.test(document.body.innerText));
        if (end || (n === prev && i > 3)) break;
        prev = n;
      }
      const items = await p.$$eval('div[role="feed"] div[role="article"]', arts => arts.map(a => {
        const link = a.querySelector('a[href*="/maps/place/"]');
        const web = [...a.querySelectorAll('a')].find(x => /sitio web|website/i.test((x.getAttribute('aria-label') || '') + (x.getAttribute('data-value') || '') + x.textContent));
        return { name: a.getAttribute('aria-label') || (link && link.getAttribute('aria-label')) || (a.innerText.split('\n')[0] || '').trim(), text: a.innerText, maps: link ? link.href.split('?')[0] : '', web: web ? web.href : '' };
      }));
      let added = 0;
      for (const it of items) {
        const key = it.maps || it.name;
        if (!it.name || seen.has(key)) continue; seen.add(key);
        const t = it.text;
        const rr = t.match(/(\d[,.]\d)\s*\(([\d.,]+)\)/);
        const phoneM = t.match(/(?:\+51\s?)?(9\d{2}\s?\d{3}\s?\d{3})\b/);
        const fijoM = t.match(/\+51\s?1\s?\d{3}\s?\d{4}|\(01\)\s?\d{3}[\s-]?\d{4}/);
        const lines = t.split('\n').map(s => s.trim()).filter(Boolean);
        const meta = lines.find(l => l.includes('·') && !/Abierto|Cerrado|Abre|Cierra/i.test(l)) || '';
        const parts = meta.split('·').map(s => s.trim()).filter(Boolean);
        out.push({
          name: it.name, query: q, maps: it.maps,
          web: /google\.com\/(maps|url)/.test(it.web) ? '' : it.web,
          rating: rr ? +rr[1].replace(',', '.') : 0, reviews: rr ? +rr[2].replace(/[.,]/g, '') : 0,
          cat: parts[0] || '', addr: parts.slice(1).join(' · '),
          wa: phoneM ? phoneM[1].replace(/\s/g, '') : '', fijo: fijoM ? fijoM[0] : '',
          closed: /Cerrado permanentemente|Cerrado temporalmente/i.test(t),
        });
        added++;
      }
      console.error(q, '->', items.length, 'resultados,', added, 'nuevos');
    } catch (e) { console.error('ERR', q, e.message.split('\n')[0]); }
  }
  await b.close();
  console.log(JSON.stringify(out, null, 1));
})();
