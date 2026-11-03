// Genera la página de un cliente a partir de su rubro y sus datos.
// Uso:  node generar.mjs cliente.json carpeta-de-salida
//       node generar.mjs --ejemplos          (arma un ejemplo por rubro en ./ejemplos)
// El JSON del cliente se explica en README.md. Las fotos van dentro de la carpeta de salida.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RUBROS } from './rubros.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

const ICON = {
  heart: '<path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6C19 16.5 12 21 12 21z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pulse: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  food: '<path d="M5 3v8a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-2 6 0 8v10"/>',
  walk: '<circle cx="13" cy="4" r="2"/><path d="M9 21l2-6 3 3v3M10 9l3-1 2 4 3 1M11 15l-1-5"/>',
  home: '<path d="M3 11l9-7 9 7M5 10v10h14V10"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 3v4M17 5h4"/>',
  tooth: '<path d="M7 3C4.5 3 3 5 3 7.5c0 3 1.5 5 2 8S6 21 7.5 21 9 18 10 16s3-2 4 0 1 5 2.5 5 2-2.5 2.5-5.5 2-5 2-8C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  spine: '<path d="M12 2v20M8 5h8M7 9h10M8 13h8M7 17h10"/>',
  paw: '<path d="M12 13c-3 0-5 3-5 5 0 1.5 1 2 2.5 2 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c1.5 0 2.5-.5 2.5-2 0-2-2-5-5-5z"/><circle cx="6" cy="10" r="2"/><circle cx="10" cy="6" r="2"/><circle cx="14" cy="6" r="2"/><circle cx="18" cy="10" r="2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  wrench: '<path d="M14 7a4 4 0 1 1 3 3L8 19a2 2 0 0 1-3-3z"/>',
  flame: '<path d="M12 3c2 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-8z"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  snow: '<path d="M12 2v20M4 6l16 12M20 6 4 18"/>',
  map: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
};
const WA_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"/></svg>';
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name] || ICON.check}</svg>`;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Celular de 9 dígitos que empieza en 9 → 51XXXXXXXXX.
function waDigits(v) {
  let d = String(v ?? '').replace(/\D/g, '');
  if (d.length === 9 && d.startsWith('9')) d = '51' + d;
  return /^519\d{8}$/.test(d) ? d : '';
}
// Teléfono para tel: celulares y fijos de Lima, con o sin 01.
function telLink(v) {
  let d = String(v ?? '').replace(/\D/g, '');
  if (d.length === 9 && d.startsWith('9')) d = '51' + d;
  else if (d.length === 9 && d.startsWith('01')) d = '511' + d.slice(2);
  else if (d.length === 7) d = '511' + d;
  else if (d.length === 8 && d.startsWith('0')) d = '51' + d.slice(1);
  return /^51\d{8,9}$/.test(d) ? '+' + d : '';
}
const showWa = (d) => `${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;

// Une el preset del rubro con lo que trae el cliente (el cliente gana).
function merge(base, extra) {
  if (Array.isArray(base) || Array.isArray(extra) || typeof base !== 'object' || typeof extra !== 'object' || !base || !extra) return extra ?? base;
  const out = { ...base };
  for (const k of Object.keys(extra)) out[k] = merge(base[k], extra[k]);
  return out;
}

export function render(cliente) {
  const preset = RUBROS[cliente.rubro];
  if (!preset) throw new Error(`Rubro desconocido: ${cliente.rubro}. Usa uno de: ${Object.keys(RUBROS).join(', ')}`);
  const c = merge(preset, cliente.textos || {});
  const col = { ...preset.colores, ...(cliente.colores || {}) };
  const nombre = esc(cliente.nombre);
  const distrito = esc(cliente.distrito || 'Lima');
  const fill = (s) => String(s).replaceAll('{nombre}', nombre).replaceAll('{distrito}', distrito);
  const wa = waDigits(cliente.whatsapp);
  const waUrl = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(cliente.waTexto || c.waTexto)}` : '#contacto';
  const waAttrs = wa ? ' target="_blank" rel="noopener"' : '';
  const tels = (cliente.telefonos || []).map((t) => ({ show: esc(t), href: telLink(t) })).filter((t) => t.href);
  const fotos = cliente.fotos || {};
  const servicios = cliente.servicios || c.servicios.items;
  const direccion = cliente.direccion ? `${cliente.direccion}, ${cliente.distrito || ''}, Lima` : '';
  const mapa = direccion ? `https://www.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed` : '';
  const comoLlegar = direccion ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}` : '';
  const redes = cliente.redes || {};

  const tarjeta = `<aside class="hero-card"><h2>${esc(c.hero.tarjeta.titulo)}</h2><ul>${c.hero.tarjeta.items.map((i) => `<li><span class="dot">${icon(i.icono)}</span><span><b>${esc(i.t)}</b>${esc(i.d)}</span></li>`).join('')}</ul></aside>`;
  const heroAside = fotos.hero ? `<figure class="hero-photo"><img src="${esc(fotos.hero)}" alt="${nombre}" width="800" height="1000"></figure>` : tarjeta;

  const telRow = tels.length ? `<div class="row">${icon('phone')}<span><b>Teléfono</b>${tels.map((t) => `<a href="tel:${t.href}">${t.show}</a>`).join(' · ')}</span></div>` : '';
  const waRow = `<div class="row">${WA_SVG}<span><b>WhatsApp</b>${wa ? `<a href="${waUrl}"${waAttrs}>${showWa(wa)}</a>` : 'Aquí irá su número de WhatsApp'}</span></div>`;
  const dirRow = direccion ? `<div class="row">${icon('map')}<span><b>Dirección</b><a href="${comoLlegar}" target="_blank" rel="noopener">${esc(cliente.direccion)}, ${distrito}</a></span></div>` : '';
  const horRow = cliente.horario ? `<div class="row">${icon('clock')}<span><b>Horario</b>${esc(cliente.horario)}</span></div>` : '';
  const redesRow = Object.keys(redes).length ? `<div class="row">${icon('users')}<span><b>Redes</b>${Object.entries(redes).map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener">${esc(k[0].toUpperCase() + k.slice(1))}</a>`).join(' · ')}</span></div>` : '';

  const waBtn = (txt, cls = 'btn btn-wa') => `<a class="${cls}" href="${waUrl}"${waAttrs}>${WA_SVG}${esc(txt)}</a>`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${nombre} · ${esc(fill(c.hero.eyebrow))}</title>
<meta name="description" content="${esc(fill(c.hero.lead)).slice(0, 160)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--tinta:${col.tinta};--fondo:${col.fondo};--marca:${col.marca};--marca2:${col.marca2};--acento:${col.acento};--suave:${col.suave};--muted:color-mix(in srgb,var(--tinta) 62%,var(--fondo));--linea:color-mix(in srgb,var(--tinta) 12%,var(--fondo));--wa:#25d366}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--fondo);color:var(--tinta);font:16px/1.6 Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%;height:auto}
a{color:inherit}
.wrap{max-width:1100px;margin:0 auto;padding:0 20px}
h1,h2,h3{line-height:1.15;letter-spacing:-.02em}
.eyebrow{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--acento);font-weight:700}
.demo{background:var(--acento);color:#fff;font-size:13px;text-align:center;padding:8px 16px;font-weight:600}
nav{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--fondo) 92%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--linea)}
nav .wrap{display:flex;align-items:center;justify-content:space-between;height:62px;gap:12px}
.brand{font-weight:800;font-size:18px;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nav-wa{display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:700;text-decoration:none;background:var(--wa);color:#08311a;padding:9px 14px;border-radius:999px;white-space:nowrap}
.nav-wa svg{width:18px;height:18px}
.hero{background:linear-gradient(160deg,var(--tinta) 0%,color-mix(in srgb,var(--tinta) 80%,var(--marca)) 100%);color:#fff}
.hero .wrap{display:grid;grid-template-columns:1.15fr .85fr;gap:40px;align-items:center;padding:64px 20px 72px}
.hero .eyebrow{color:color-mix(in srgb,var(--acento) 70%,#fff)}
.hero h1{font-size:clamp(34px,5.6vw,56px);margin:14px 0 16px}
.hero h1 em{font-style:normal;color:color-mix(in srgb,var(--acento) 75%,#fff)}
.lead{font-size:18px;color:color-mix(in srgb,#fff 78%,var(--tinta));max-width:52ch}
.cta-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}
.btn{display:inline-flex;align-items:center;gap:10px;font-weight:700;text-decoration:none;padding:14px 22px;border-radius:999px;font-size:16px;transition:transform .15s ease}
.btn:active{transform:scale(.97)}
.btn svg{width:20px;height:20px;flex:none}
.btn-wa{background:var(--wa);color:#08311a}
.btn-ghost{border:1px solid rgba(255,255,255,.3);color:#fff}
.badges{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}
.badges span{font-size:13px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);padding:7px 12px;border-radius:999px}
.hero-card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);border-radius:22px;padding:26px}
.hero-card h2{font-size:18px;margin-bottom:14px}
.hero-card ul{list-style:none;display:grid;gap:12px}
.hero-card li{display:flex;gap:12px;align-items:flex-start;font-size:15px;color:color-mix(in srgb,#fff 80%,var(--tinta))}
.hero-card li b{display:block;color:#fff}
.dot{width:30px;height:30px;border-radius:9px;background:color-mix(in srgb,var(--acento) 22%,transparent);display:grid;place-items:center;flex:none}
.dot svg{width:17px;height:17px;stroke:color-mix(in srgb,var(--acento) 80%,#fff)}
.hero-photo{border-radius:22px;overflow:hidden;aspect-ratio:4/5;box-shadow:0 30px 70px -30px rgba(0,0,0,.6)}
.hero-photo img{width:100%;height:100%;object-fit:cover}
section{padding:72px 0}
.head{max-width:640px;margin-bottom:34px}
.head h2{font-size:clamp(28px,4vw,40px);margin:10px 0}
.head p{color:var(--muted)}
.needs{background:var(--suave)}
.needs ul{list-style:none;display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.needs li{background:#fff;border-radius:16px;padding:20px;display:grid;gap:8px}
.needs li b{display:block}
.needs li span{color:var(--muted);font-size:15px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.card{background:#fff;border:1px solid var(--linea);border-radius:18px;padding:24px;display:flex;flex-direction:column;gap:10px}
.ico{width:52px;height:52px;border-radius:14px;background:var(--suave);display:grid;place-items:center}
.ico svg{width:28px;height:28px;stroke:var(--marca)}
.card h3{font-size:19px}
.card p{color:var(--muted);font-size:15px}
.card ul{list-style:none;font-size:14px;display:grid;gap:4px;margin-top:auto;padding-top:6px}
.card li::before{content:"✓ ";color:var(--marca);font-weight:700}
.feature{background:#fff;border-top:1px solid var(--linea);border-bottom:1px solid var(--linea)}
.feature .wrap{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
.feature-box{background:linear-gradient(150deg,var(--suave),color-mix(in srgb,var(--suave) 60%,var(--acento)));border-radius:22px;padding:30px}
.feature-box ol{padding-left:20px;display:grid;gap:10px;font-weight:500}
.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.gallery img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:16px}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;counter-reset:s}
.step{background:#fff;border:1px solid var(--linea);border-radius:18px;padding:24px}
.step::before{counter-increment:s;content:counter(s);display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:var(--marca);color:#fff;font-weight:800;margin-bottom:12px}
.step h3{font-size:18px;margin-bottom:6px}
.step p{color:var(--muted);font-size:15px}
.faq details{background:#fff;border:1px solid var(--linea);border-radius:14px;padding:18px 20px}
.faq details+details{margin-top:12px}
.faq summary{font-weight:600;cursor:pointer}
.faq details p{margin-top:10px;color:var(--muted)}
.map{width:100%;height:320px;border:0;border-radius:18px;background:var(--suave)}
.contact{background:var(--tinta);color:#fff}
.contact .wrap{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:start}
.contact h2{font-size:clamp(28px,4vw,40px);margin:10px 0 12px}
.contact p{color:color-mix(in srgb,#fff 75%,var(--tinta))}
.contact-card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);border-radius:22px;padding:26px;display:grid;gap:16px}
.row{display:flex;gap:12px;align-items:flex-start;font-size:15px;color:color-mix(in srgb,#fff 82%,var(--tinta));overflow-wrap:anywhere}
.row svg{width:22px;height:22px;flex:none;stroke:color-mix(in srgb,var(--acento) 80%,#fff);color:var(--wa);margin-top:2px}
.row b{display:block;color:#fff}
.row a{text-decoration:underline;text-underline-offset:3px}
footer{background:color-mix(in srgb,var(--tinta) 88%,#000);color:color-mix(in srgb,#fff 55%,var(--tinta));font-size:13px;text-align:center;padding:24px 20px}
.fab{position:fixed;right:16px;bottom:16px;z-index:30;width:58px;height:58px;border-radius:50%;background:var(--wa);color:#fff;display:grid;place-items:center;box-shadow:0 12px 30px -8px rgba(0,0,0,.35)}
.fab svg{width:30px;height:30px}
@media (max-width:900px){
  .hero .wrap,.feature .wrap,.contact .wrap{grid-template-columns:1fr}
  .grid,.needs ul{grid-template-columns:repeat(2,1fr)}
  .steps{grid-template-columns:1fr}
  .gallery{grid-template-columns:repeat(2,1fr)}
}
@media (max-width:560px){
  .grid,.needs ul{grid-template-columns:1fr}
  section{padding:56px 0}
  .hero .wrap{padding:44px 20px 52px}
  .btn{width:100%;justify-content:center}
  .brand{font-size:16px}
}
</style>
</head>
<body>
${cliente.muestra ? `<div class="demo">Muestra gratuita preparada por SV WebStudio para ${nombre}</div>\n` : ''}<nav>
  <div class="wrap">
    <a class="brand" href="#">${nombre}</a>
    <a class="nav-wa" href="${waUrl}"${waAttrs}>${WA_SVG}WhatsApp</a>
  </div>
</nav>

<header class="hero">
  <div class="wrap">
    <div>
      <span class="eyebrow">${esc(fill(c.hero.eyebrow))}</span>
      <h1>${fill(c.hero.titulo)}</h1>
      <p class="lead">${esc(fill(c.hero.lead))}</p>
      <div class="cta-row">${waBtn('Escríbanos por WhatsApp')}<a class="btn btn-ghost" href="#servicios">Ver servicios</a></div>
      <div class="badges">${c.hero.badges.map((b) => `<span>${esc(b)}</span>`).join('')}</div>
    </div>
    ${heroAside}
  </div>
</header>
${fotos.hero ? `
<section class="needs">
  <div class="wrap">
    <div class="head"><span class="eyebrow">Le ayudamos</span><h2>${esc(c.hero.tarjeta.titulo)}</h2></div>
    <ul>${c.hero.tarjeta.items.map((i) => `<li><span class="ico">${icon(i.icono)}</span><b>${esc(i.t)}</b><span>${esc(i.d)}</span></li>`).join('')}</ul>
  </div>
</section>` : ''}
<section id="servicios">
  <div class="wrap">
    <div class="head"><span class="eyebrow">Servicios</span><h2>${esc(c.servicios.titulo)}</h2><p>${esc(fill(c.servicios.lead))}</p></div>
    <div class="grid">
      ${servicios.map((s) => `<article class="card"><div class="ico">${icon(s.icono)}</div><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p>${s.b?.length ? `<ul>${s.b.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</article>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="feature">
  <div class="wrap">
    <div class="head" style="margin:0"><span class="eyebrow">${esc(c.destacado.eyebrow)}</span><h2>${esc(fill(c.destacado.titulo))}</h2><p>${esc(fill(c.destacado.texto))}</p></div>
    <div class="feature-box"><ol>${c.destacado.lista.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div>
  </div>
</section>
${fotos.galeria?.length ? `
<section>
  <div class="wrap">
    <div class="head"><span class="eyebrow">Galería</span><h2>Conózcanos</h2></div>
    <div class="gallery">${fotos.galeria.map((f, i) => `<img src="${esc(f)}" alt="${nombre} ${i + 1}" loading="lazy" width="800" height="600">`).join('')}</div>
  </div>
</section>` : ''}
<section>
  <div class="wrap">
    <div class="head"><span class="eyebrow">Cómo empezar</span><h2>Es muy fácil</h2></div>
    <div class="steps">${c.pasos.map((p) => `<div class="step"><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p></div>`).join('')}</div>
  </div>
</section>

<section class="faq">
  <div class="wrap">
    <div class="head"><span class="eyebrow">Preguntas frecuentes</span><h2>Lo que nos preguntan</h2></div>
    ${c.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n    ')}
  </div>
</section>
${mapa ? `
<section style="padding-top:0">
  <div class="wrap">
    <div class="head"><span class="eyebrow">Ubicación</span><h2>Dónde estamos</h2><p>${esc(cliente.direccion)}, ${distrito}. <a href="${comoLlegar}" target="_blank" rel="noopener">Cómo llegar</a></p></div>
    <iframe class="map" src="${mapa}" title="Mapa de ${nombre}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
  </div>
</section>` : ''}
<section class="contact" id="contacto">
  <div class="wrap">
    <div>
      <span class="eyebrow">Contacto</span>
      <h2>${esc(c.cta.titulo)}</h2>
      <p>${esc(c.cta.texto)}</p>
      <div class="cta-row">${waBtn('Escribir por WhatsApp')}</div>
    </div>
    <div class="contact-card">${waRow}${telRow}${dirRow}${horRow}${redesRow}${!wa && cliente.muestra ? '<p style="font-size:13px;color:#ffc79a">En la versión final, todos los botones verdes abren directo su WhatsApp.</p>' : ''}</div>
  </div>
</section>

<footer>${nombre} · ${distrito}, Lima${cliente.muestra ? '<br>Muestra preparada por SV WebStudio' : '<br>Web hecha por <a href="https://sv-web-studio.vercel.app/" target="_blank" rel="noopener">SV WebStudio</a>'}</footer>

<a class="fab" href="${waUrl}"${waAttrs} aria-label="WhatsApp">${WA_SVG}</a>
</body>
</html>
`;
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--ejemplos') {
    const ejemplos = JSON.parse(fs.readFileSync(path.join(here, 'ejemplos.json'), 'utf8'));
    for (const e of ejemplos) {
      const out = path.join(here, 'ejemplos', e.rubro);
      fs.mkdirSync(out, { recursive: true });
      fs.writeFileSync(path.join(out, 'index.html'), render(e));
      console.log('ok', e.rubro);
    }
    return;
  }
  if (args.length !== 2) {
    console.error('Uso: node generar.mjs cliente.json carpeta-de-salida   |   node generar.mjs --ejemplos');
    process.exit(1);
  }
  const cliente = JSON.parse(fs.readFileSync(args[0], 'utf8'));
  fs.mkdirSync(args[1], { recursive: true });
  fs.writeFileSync(path.join(args[1], 'index.html'), render(cliente));
  console.log('ok', path.join(args[1], 'index.html'));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
