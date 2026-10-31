// Uso: node pa_lote.js <status.json> <max> <slug1> <slug2> ...  -> imprime JSON de candidatos
const fs = require('fs');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const LIMA = ['Lima','Cercado De Lima','Ate','Barranco','Breña','Carabayllo','Chaclacayo','Chorrillos','Cieneguilla','Comas','El Agustino','Independencia','Jesús María','Jesus Maria','La Molina','La Victoria','Lince','Los Olivos','Lurigancho','Lurín','Magdalena Del Mar','Miraflores','Pachacámac','Pueblo Libre','Puente Piedra','Rímac','San Bartolo','San Borja','San Isidro','San Juan De Lurigancho','San Juan De Miraflores','San Luis','San Martín De Porres','San Miguel','Santa Anita','Santiago De Surco','Surco','Surquillo','Villa El Salvador','Villa María Del Triunfo','Callao','Bellavista','La Perla','Ventanilla','Magdalena Vieja','Santa Rosa','Ancón','Punta Hermosa'];
const norm = s => (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const limaSet = new Set(LIMA.map(norm));
const [statusPath, maxS, ...slugs] = process.argv.slice(2);
const max = +maxS || 40;
const known = new Set((JSON.parse(fs.readFileSync(statusPath)).names || []).map(norm));
const knownWa = new Set();
const EXCL = /canitas|virgen del carmen|roxste|art ?& ?glass|prueba pacom/i;
try { fs.readFileSync(__dirname + '/exportados.txt', 'utf8').split('\n').forEach(l => { const [n, w] = l.split('\t'); if (n) known.add(norm(n)); if (w) knownWa.add(w.trim()); }); } catch (e) {}
const SKIP = /paginasamarillas|gurusoluciones|gurugo|guruconecta|paginasblancas|amarillas\.cl|paginas-amarillas|facebook|instagram|tiktok|youtube|linkedin|twitter|google|wa\.me|whatsapp|mailto|tel:|javascript/i;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36' });
  const out = [], seen = new Set();
  for (const slug of slugs) {
    if (out.length >= max) break;
    let items = [];
    try {
      await p.goto('https://www.paginasamarillas.com.pe/servicios/' + slug, { timeout: 40000, waitUntil: 'domcontentloaded' });
      await p.waitForTimeout(1500);
      if (!/\/servicios\//.test(p.url())) { console.error('sin rubro:', slug); continue; }
      const ld = await p.$$eval('script[type="application/ld+json"]', ss => ss.map(s => s.textContent));
      for (const t of ld) { try { const j = JSON.parse(t); (Array.isArray(j) ? j : [j]).forEach(x => x && x.name && items.push(x)); } catch (e) {} }
    } catch (e) { console.error('ERR', slug, e.message.split('\n')[0]); continue; }
    for (const x of items) {
      if (out.length >= max) break;
      const tel = (x.telephone || '').replace(/[^0-9]/g, '');
      const district = typeof x.address === 'string' ? x.address : ((x.address||{}).addressLocality || '');
      const k = norm(x.name);
      if (!/^9\d{8}$/.test(tel) || !limaSet.has(norm(district)) || known.has(k) || seen.has(k) || knownWa.has(tel) || EXCL.test(x.name)) continue;
      seen.add(k); knownWa.add(tel);
      let web = '';
      try {
        await p.goto(x.url, { timeout: 30000, waitUntil: 'domcontentloaded' });
        await p.waitForTimeout(800);
        const links = await p.$$eval('a', as => as.map(a => ({ h: a.href, t: (a.innerText || '').toLowerCase() })));
        const cand = links.filter(l => /^https?:/.test(l.h) && !/paginasamarillas|gurusoluciones|gurugo|guruconecta|paginasblancas|amarillas\.cl|paginas-amarillas|facebook|instagram|tiktok|youtube|linkedin|twitter|google|wa\.me|whatsapp|generadoresperu|leafletjs|openstreetmap|mapbox|gurusoluciones/i.test(l.h));
        web = (cand.find(l => /web|sitio/.test(l.t)) || cand[0] || {}).h || '';
      } catch (e) {}
      out.push({ name: x.name, category: slug.replace(/-/g, ' '), district, wa: tel, telRaw: x.telephone, web, ficha: x.url });
    }
  }
  await b.close();
  console.log(JSON.stringify(out, null, 1));
})();
