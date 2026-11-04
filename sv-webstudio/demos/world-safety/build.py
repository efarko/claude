# Genera las 3 propuestas para World Safety Perú: landing (S/ 300), web (S/ 500) y catalogo (S/ 800).
import os, urllib.parse
D = os.path.dirname(os.path.abspath(__file__))
WA = '51961611555'
def wa(t): return f'https://wa.me/{WA}?text=' + urllib.parse.quote(t)

CATS = [
  ('Protección de cabeza', 'Cascos y accesorios', 'casco.png'),
  ('Protección respiratoria', 'Respiradores, filtros y cartuchos', 'respirador.png'),
  ('Protección auditiva', 'Tapones y orejeras', 'orejeras.png'),
  ('Protección de manos', 'Guantes anticorte, cuero, nitrilo y soldadura', 'guantes.png'),
  ('Ropa industrial', 'Uniformes, ponchos, casacas y polainas', 'poncho.png'),
  ('Protección ambiental', 'Barreras de contención y kits de derrame', 'kit.png'),
]
PRODS = [
  ('Casco Libus Milenium Class', 'Protección de cabeza', 'casco.png'),
  ('Respirador MSA Advantage 200 LS', 'Protección respiratoria', 'respirador.png'),
  ('Cartucho 3M 6059 multigás', 'Protección respiratoria', 'cartucho.png'),
  ('Orejeras 3M Peltor Optime H10A', 'Protección auditiva', 'orejeras.png'),
  ('Guantes Steelpro Multiflex látex', 'Protección de manos', 'guantes.png'),
  ('Poncho impermeable World Safety', 'Ropa industrial', 'poncho.png'),
  ('Casaca térmica GYW', 'Ropa industrial', 'campera.png'),
  ('Polainas de cuero sintético', 'Ropa industrial', 'polainas.png'),
  ('Chaleco salvavidas cuello alto', 'Ropa industrial', 'chaleco.png'),
  ('Kit para derrame de petróleo', 'Protección ambiental', 'kit.png'),
]
CLIENTES = ['c-repsol.jpg','c-tottus.jpg','c-makro.png','c-cepsa.jpg','c-frontera.jpg','c-oefa.png','c-sencico.jpg','c-andes.jpg']
MARCAS = ['MSA','3M','Delta Plus','Portwest','CAT','Bata','Libus']
WA_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-3.3-.8-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"/></svg>'

CSS = '''
:root{--ink:#0d1b3d;--blue:#1d3f99;--blue2:#142d73;--yel:#f5b800;--bg:#f4f6fa;--muted:#55607a;--line:#e1e6ef;--wa:#25d366}
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
body{font:16px/1.6 Inter,system-ui,sans-serif;color:var(--ink);background:var(--bg);-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%;height:auto}a{color:inherit}
.wrap{max-width:1140px;margin:0 auto;padding:0 20px}
h1,h2,h3{line-height:1.15;letter-spacing:-.02em}
.eyebrow{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--blue);font-weight:700}
.demo{display:block;background:var(--yel);color:#2b2100;font-size:13px;text-align:center;padding:8px 16px;font-weight:700;text-decoration:none}
nav{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.95);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
nav .wrap{display:flex;align-items:center;justify-content:space-between;height:66px;gap:14px}
.logo img{height:40px;width:auto}
.links{display:flex;gap:22px;font-size:15px;font-weight:500}.links a{text-decoration:none;color:var(--muted)}
.nav-wa{display:inline-flex;align-items:center;gap:8px;background:var(--wa);color:#08311a;font-weight:700;text-decoration:none;padding:9px 14px;border-radius:999px;font-size:14px;white-space:nowrap}
.nav-wa svg,.btn svg{width:19px;height:19px}
.hero{position:relative;color:#fff;background:linear-gradient(100deg,rgba(13,27,61,.94) 0%,rgba(20,45,115,.82) 55%,rgba(20,45,115,.35) 100%),url(img/banner1.jpg) center/cover}
.hero .wrap{padding:84px 20px 92px}
.hero h1{font-size:clamp(34px,5.4vw,58px);max-width:15ch;margin:14px 0 16px}
.hero h1 em{font-style:normal;color:var(--yel)}
.hero p{font-size:18px;max-width:54ch;color:#d6def0}
.hero .eyebrow{color:var(--yel)}
.cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
.btn{display:inline-flex;align-items:center;gap:10px;font-weight:700;text-decoration:none;padding:14px 22px;border-radius:999px;border:0;font:inherit;font-weight:700;cursor:pointer}
.btn-wa{background:var(--wa);color:#08311a}.btn-y{background:var(--yel);color:#2b2100}.btn-ghost{border:1px solid rgba(255,255,255,.35);color:#fff}
.stats{display:flex;flex-wrap:wrap;gap:26px;margin-top:34px}.stats b{display:block;font-size:28px;color:#fff}.stats span{font-size:14px;color:#c4cee6}
section{padding:72px 0}.head{max-width:680px;margin-bottom:34px}.head h2{font-size:clamp(28px,4vw,40px);margin:10px 0}.head p{color:var(--muted)}
.cats{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.cat{background:#fff;border:1px solid var(--line);border-radius:18px;padding:22px;display:flex;gap:16px;align-items:center;text-decoration:none}
.cat img{width:84px;height:84px;object-fit:contain;flex:none}.cat h3{font-size:18px}.cat p{color:var(--muted);font-size:14px}
.why{background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.why-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.why-grid div{border-left:3px solid var(--yel);padding:6px 0 6px 16px}.why-grid b{display:block;font-size:18px}.why-grid span{color:var(--muted);font-size:15px}
.brands{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}.brands span{background:var(--bg);border:1px solid var(--line);border-radius:999px;padding:8px 16px;font-weight:700;color:var(--blue2)}
.logos{display:grid;grid-template-columns:repeat(8,1fr);gap:14px;align-items:center}
.logos img{width:100%;height:56px;object-fit:contain;background:#fff;border-radius:12px;padding:8px;border:1px solid var(--line)}
.about{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center}
.about img{border-radius:20px;aspect-ratio:4/3;object-fit:cover;width:100%}
.svc{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.svc div{background:#fff;border:1px solid var(--line);border-radius:18px;padding:24px}.svc h3{font-size:19px;margin-bottom:6px}.svc p{color:var(--muted);font-size:15px}
.filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px}
.filters button{font:inherit;font-size:14px;font-weight:600;border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 14px;cursor:pointer;color:var(--ink)}
.filters button[aria-pressed=true]{background:var(--blue);border-color:var(--blue);color:#fff}
.prods{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.prod{background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:10px}
.prod img{width:100%;aspect-ratio:1;object-fit:contain}.prod small{color:var(--blue);font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:.06em}
.prod h3{font-size:16px}.prod .btn{justify-content:center;padding:11px 14px;font-size:14px;margin-top:auto}
.prod .add{background:var(--blue);color:#fff}.prod .add.on{background:var(--yel);color:#2b2100}
.quote{position:fixed;left:16px;right:16px;bottom:16px;z-index:40;max-width:560px;margin:0 auto;background:var(--ink);color:#fff;border-radius:18px;padding:14px 16px;display:none;align-items:center;gap:12px;box-shadow:0 20px 50px -15px rgba(0,0,0,.5)}
.quote.show{display:flex}.quote span{flex:1;font-size:15px}.quote .btn{padding:11px 16px;font-size:14px}
.qpanel{position:fixed;inset:0;z-index:50;background:rgba(13,27,61,.55);display:none;align-items:flex-end;justify-content:center}
.qpanel.show{display:flex}.qbox{background:#fff;width:100%;max-width:560px;border-radius:22px 22px 0 0;padding:22px;max-height:85vh;overflow:auto}
.qbox h3{font-size:20px;margin-bottom:12px}.qrow{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}
.qrow span{flex:1;font-size:15px}.qrow input{width:70px;font:inherit;padding:8px;border:1px solid var(--line);border-radius:10px}
.qbox label{display:block;font-size:14px;font-weight:600;margin-top:14px}.qbox input.full{width:100%;font:inherit;padding:11px;border:1px solid var(--line);border-radius:12px;margin-top:6px}
.contact{background:var(--ink);color:#fff}.contact .wrap{display:grid;grid-template-columns:1fr 1fr;gap:40px}
.contact h2{font-size:clamp(28px,4vw,40px);margin:10px 0}.contact p{color:#c4cee6}.contact .eyebrow{color:var(--yel)}
.rows{display:grid;gap:14px;margin-top:20px}.rows div{font-size:15px;color:#dbe2f2}.rows b{display:block;color:#fff}.rows a{text-decoration:underline;text-underline-offset:3px}
.map{width:100%;height:100%;min-height:300px;border:0;border-radius:18px}
.sedes{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.sedes div{background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px}.sedes b{display:block}
footer{background:#08122b;color:#8d9bbd;font-size:13px;text-align:center;padding:22px 20px}
.fab{position:fixed;right:16px;bottom:16px;z-index:30;width:58px;height:58px;border-radius:50%;background:var(--wa);color:#fff;display:grid;place-items:center;box-shadow:0 12px 30px -8px rgba(0,0,0,.35)}.fab svg{width:30px;height:30px}
body.has-quote .fab{bottom:96px}
@media (max-width:980px){.links{display:none}.cats,.svc,.sedes{grid-template-columns:repeat(2,1fr)}.why-grid{grid-template-columns:repeat(2,1fr)}.prods{grid-template-columns:repeat(3,1fr)}.logos{grid-template-columns:repeat(4,1fr)}.about,.contact .wrap{grid-template-columns:1fr}}
@media (max-width:600px){.cats,.svc,.sedes{grid-template-columns:1fr}.prods{grid-template-columns:repeat(2,1fr)}.hero .wrap{padding:56px 20px 64px}section{padding:56px 0}.cta .btn{width:100%;justify-content:center}.logo img{height:32px}.prod h3{font-size:14px}}
'''

def page(tier):
    label = {'web':'Opción A · Web corporativa · S/ 500','catalogo':'Opción B · Catálogo con cotizador · S/ 1,200'}[tier]
    full = tier in ('web','catalogo')
    cat = tier == 'catalogo'
    links = '<a href="#productos">Productos</a>' + ('<a href="#nosotros">Nosotros</a><a href="#servicios">Servicios</a>' if full else '') + ('<a href="#catalogo">Catálogo</a>' if cat else '') + '<a href="#contacto">Contacto</a>'
    h = []
    h.append(f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>World Safety Perú · Equipos de protección personal en Lima</title>
<meta name="description" content="Distribuidores de equipos de protección personal y confeccionistas de ropa industrial. MSA, 3M, Delta Plus, Portwest y más. 25 años de experiencia. Cotice por WhatsApp.">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>{CSS}</style></head><body>
<a class="demo" href="../">Propuesta de SV WebStudio · {label} · Ver las 2 opciones</a>
<nav><div class="wrap"><a class="logo" href="#"><img src="img/logo.jpg" alt="World Safety Perú" width="200" height="56"></a><div class="links">{links}</div>
<a class="nav-wa" href="{wa('Hola, quisiera una cotización de equipos de protección')}" target="_blank" rel="noopener">{WA_SVG}Cotizar</a></div></nav>
<header class="hero"><div class="wrap"><span class="eyebrow">Equipos de protección personal · Lima</span>
<h1>Protegemos a su equipo de trabajo <em>con las mejores marcas</em></h1>
<p>Distribuidores de equipos de protección personal y confeccionistas de ropa industrial. Atendemos a empresas de minería, construcción, petróleo, retail y gobierno con stock y entrega rápida.</p>
<div class="cta"><a class="btn btn-wa" href="{wa('Hola, quisiera una cotización de equipos de protección')}" target="_blank" rel="noopener">{WA_SVG}Cotizar por WhatsApp</a><a class="btn btn-ghost" href="#{'catalogo' if cat else 'productos'}">{'Ver catálogo' if cat else 'Ver productos'}</a></div>
<div class="stats"><div><b>25 años</b><span>en el sector industrial</span></div><div><b>3 sedes</b><span>en el país</span></div><div><b>+7 marcas</b><span>MSA, 3M, Delta Plus…</span></div></div></div></header>''')
    h.append('<section id="productos"><div class="wrap"><div class="head"><span class="eyebrow">Productos</span><h2>Todo el equipo de protección que su empresa necesita</h2><p>Elija una categoría y le enviamos la cotización por WhatsApp el mismo día.</p></div><div class="cats">')
    for t, d, img in CATS:
        h.append(f'<a class="cat" href="{wa("Hola, quisiera cotizar " + t.lower())}" target="_blank" rel="noopener"><img src="img/{img}" alt="{t}" width="84" height="84" loading="lazy"><div><h3>{t}</h3><p>{d}</p></div></a>')
    h.append('</div></div></section>')
    h.append('<section class="why"><div class="wrap"><div class="head"><span class="eyebrow">Por qué World Safety</span><h2>Un solo proveedor para toda su seguridad</h2></div><div class="why-grid">'
             '<div><b>25 años de experiencia</b><span>Conocemos lo que exige cada industria.</span></div>'
             '<div><b>Marcas originales</b><span>Distribuidores de MSA, 3M, Delta Plus, Portwest, CAT, Bata y Libus.</span></div>'
             '<div><b>Calidad garantizada</b><span>Productos que cumplen los estándares de calidad.</span></div>'
             '<div><b>Precio y rapidez</b><span>Precios competitivos y entrega rápida desde 3 sedes.</span></div></div>'
             '<div class="brands">' + ''.join(f'<span>{m}</span>' for m in MARCAS) + '</div></div></section>')
    if full:
        h.append(f'''<section id="nosotros"><div class="wrap about"><div class="head" style="margin:0"><span class="eyebrow">Quiénes somos</span><h2>Seguridad industrial y cuidado del medio ambiente</h2>
<p>Somos distribuidores de equipos de protección personal y confeccionistas de ropa de uso industrial, chalecos salvavidas, barreras de contención y polainas contra mordeduras. Tenemos 25 años de experiencia acompañando a empresas en todo el Perú.</p>
<div class="cta"><a class="btn btn-y" href="{wa('Hola, quisiera conversar sobre una compra para mi empresa')}" target="_blank" rel="noopener">Hablar con un asesor</a></div></div>
<img src="img/banner3.jpg" alt="Equipos de protección World Safety" width="800" height="600" loading="lazy"></div></section>
<section id="servicios" style="padding-top:0"><div class="wrap"><div class="head"><span class="eyebrow">Servicios</span><h2>Más que venta de equipos</h2></div><div class="svc">
<div><h3>Recarga de extintores</h3><p>Recarga y mantenimiento de extintores de polvo químico seco (PQS), CO2, agua y más.</p></div>
<div><h3>Confección industrial</h3><p>Uniformes, ropa para lluvia y frío, chalecos y polainas, confeccionados por nosotros.</p></div>
<div><h3>Protección ambiental</h3><p>Barreras de contención, kits de derrame y kits de mantenimiento.</p></div></div></div></section>''')
    if cat:
        cats = sorted(set(p[1] for p in PRODS))
        h.append('<section id="catalogo" style="background:#fff;border-top:1px solid var(--line)"><div class="wrap"><div class="head"><span class="eyebrow">Catálogo</span><h2>Arme su cotización en un minuto</h2><p>Agregue los productos que necesita, indique las cantidades y envíe su pedido por WhatsApp. Le respondemos con precios y stock.</p></div>')
        h.append('<div class="filters" role="group" aria-label="Filtrar por categoría"><button aria-pressed="true" data-c="">Todos</button>' + ''.join(f'<button aria-pressed="false" data-c="{c}">{c}</button>' for c in cats) + '</div><div class="prods">')
        for n, c, img in PRODS:
            h.append(f'<article class="prod" data-c="{c}"><img src="img/{img}" alt="{n}" width="400" height="400" loading="lazy"><small>{c}</small><h3>{n}</h3><button class="btn add" data-n="{n}">Agregar a cotización</button></article>')
        h.append('</div></div></section>')
    h.append(f'''<section><div class="wrap"><div class="head"><span class="eyebrow">Nuestros clientes</span><h2>Empresas que confían en nosotros</h2></div><div class="logos">{''.join(f'<img src="img/{c}" alt="Cliente" width="160" height="56" loading="lazy">' for c in CLIENTES)}</div></div></section>''')
    h.append(f'''<section class="contact" id="contacto"><div class="wrap"><div><span class="eyebrow">Contacto</span><h2>Pida su cotización hoy</h2><p>Escríbanos por WhatsApp con lo que necesita y le respondemos con precios y stock.</p>
<div class="cta"><a class="btn btn-wa" href="{wa('Hola, quisiera una cotización de equipos de protección')}" target="_blank" rel="noopener">{WA_SVG}Escribir por WhatsApp</a></div>
<div class="rows"><div><b>Dirección</b><a href="https://www.google.com/maps/search/?api=1&query={urllib.parse.quote('Av. Guardia Civil 1282, San Isidro, Lima')}" target="_blank" rel="noopener">Av. Guardia Civil 1282, San Isidro, Lima</a></div>
<div><b>Celular</b><a href="tel:+51961611555">961 611 555</a> · <a href="tel:+51996494571">996 494 571</a></div><div><b>Teléfono fijo</b><a href="tel:+5116540787">(01) 654-0787</a></div>
<div><b>Correo</b><a href="mailto:ventas@grupoworld.pe">ventas@grupoworld.pe</a></div><div><b>Horario</b>Lunes a viernes, 9 am a 6 pm</div></div></div>
<iframe class="map" src="https://www.google.com/maps?q={urllib.parse.quote('Av. Guardia Civil 1282, San Isidro, Lima')}&output=embed" title="Mapa" loading="lazy"></iframe></div></section>
<footer>World Safety Perú · Equipos de protección personal · San Isidro, Lima<br>Propuesta preparada por SV WebStudio</footer>
<a class="fab" href="{wa('Hola, quisiera una cotización de equipos de protección')}" target="_blank" rel="noopener" aria-label="WhatsApp">{WA_SVG}</a>''')
    if cat:
        h.append(f'''<div class="quote" id="quote"><span id="qcount">0 productos en su cotización</span><button class="btn btn-y" id="qopen">Ver y enviar</button></div>
<div class="qpanel" id="qpanel"><div class="qbox"><h3>Su cotización</h3><div id="qlist"></div>
<label>Empresa<input class="full" id="qemp" placeholder="Nombre de su empresa"></label><label>RUC (opcional)<input class="full" id="qruc" inputmode="numeric"></label>
<div class="cta"><button class="btn btn-wa" id="qsend">{WA_SVG}Enviar por WhatsApp</button><button class="btn" id="qclose" style="background:var(--bg)">Seguir agregando</button></div></div></div>
<script>
(()=>{{const items=new Map();const $=s=>document.querySelector(s);
const sync=()=>{{const n=items.size;$('#qcount').textContent=n+(n===1?' producto':' productos')+' en su cotización';$('#quote').classList.toggle('show',n>0);document.body.classList.toggle('has-quote',n>0);
document.querySelectorAll('.add').forEach(b=>{{const on=items.has(b.dataset.n);b.classList.toggle('on',on);b.textContent=on?'Agregado ✓':'Agregar a cotización'}})}};
document.querySelectorAll('.add').forEach(b=>b.addEventListener('click',()=>{{items.has(b.dataset.n)?items.delete(b.dataset.n):items.set(b.dataset.n,1);sync()}}));
document.querySelectorAll('.filters button').forEach(b=>b.addEventListener('click',()=>{{document.querySelectorAll('.filters button').forEach(x=>x.setAttribute('aria-pressed',x===b));
document.querySelectorAll('.prod').forEach(p=>p.hidden=!!b.dataset.c&&p.dataset.c!==b.dataset.c)}}));
$('#qopen').addEventListener('click',()=>{{$('#qlist').innerHTML='';items.forEach((q,n)=>{{const r=document.createElement('div');r.className='qrow';r.innerHTML='<span></span><input type="number" min="1" value="'+q+'" aria-label="Cantidad">';r.querySelector('span').textContent=n;r.querySelector('input').addEventListener('input',e=>items.set(n,Math.max(1,+e.target.value||1)));$('#qlist').appendChild(r)}});$('#qpanel').classList.add('show')}});
$('#qclose').addEventListener('click',()=>$('#qpanel').classList.remove('show'));
$('#qsend').addEventListener('click',()=>{{let t='Hola, quisiera cotizar:\\n';items.forEach((q,n)=>t+='• '+q+' x '+n+'\\n');const e=$('#qemp').value.trim(),r=$('#qruc').value.trim();if(e)t+='\\nEmpresa: '+e;if(r)t+='\\nRUC: '+r;
window.open('https://wa.me/{WA}?text='+encodeURIComponent(t),'_blank')}});sync()}})();
</script>''')
    h.append('</body></html>')
    return '\n'.join(h)

for t in ('web','catalogo'):
    os.makedirs(os.path.join(D, t), exist_ok=True)
    html = page(t).replace('src="img/', 'src="../img/').replace('url(img/', 'url(../img/')
    open(os.path.join(D, t, 'index.html'), 'w').write(html)

idx = f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Propuesta web · World Safety Perú</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>{CSS}
.plans{{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:30px}}.plan{{background:#fff;border:1px solid var(--line);border-radius:22px;padding:26px;display:flex;flex-direction:column;gap:12px}}
.plan.rec{{border:2px solid var(--yel);box-shadow:0 20px 50px -25px rgba(13,27,61,.4)}}.plan .price{{font-size:40px;font-weight:800;letter-spacing:-.03em}}.plan .price small{{font-size:15px;font-weight:500;color:var(--muted)}}
.plan ul{{list-style:none;display:grid;gap:7px;font-size:15px}}.plan li::before{{content:"✓ ";color:var(--blue);font-weight:800}}.plan .btn{{justify-content:center;margin-top:auto}}.tag{{align-self:flex-start;background:var(--yel);color:#2b2100;font-size:12px;font-weight:800;border-radius:999px;padding:4px 10px}}
@media (max-width:980px){{.plans{{grid-template-columns:1fr}}}}</style></head><body>
<section><div class="wrap"><img src="img/logo.jpg" alt="World Safety Perú" style="height:46px;width:auto;margin-bottom:22px">
<div class="head"><span class="eyebrow">Propuesta de SV WebStudio</span><h2>Nueva página web para World Safety Perú</h2><p>Dos opciones, ya armadas con su información. Ábralas desde su celular y elija la que mejor se adapta a su empresa. Todas incluyen botón de WhatsApp, teléfonos que se llaman con un toque, mapa y diseño que se ve bien en celular y computadora.</p></div>
<div class="plans" style="grid-template-columns:repeat(2,1fr)">
<div class="plan"><b>Opción A · Web corporativa</b><div class="price">S/ 500 <small>o S/ 99 al mes</small></div><ul><li>Diseño que se ve completo en el celular y en la computadora</li><li>Productos por categoría, marcas y clientes</li><li>Quiénes somos y servicios (extintores, confección, protección ambiental)</li><li>WhatsApp y teléfonos que conectan con un toque</li><li>En su mismo dominio grupoworld.pe</li><li>Lista en 7 a 10 días</li></ul><a class="btn btn-y" href="web/">Ver la opción A</a></div>
<div class="plan rec"><span class="tag">Recomendada para World Safety</span><b>Opción B · Catálogo con cotizador</b><div class="price">S/ 1,200</div><ul><li>Todo lo de la opción A</li><li>Catálogo con fotos y filtros por categoría (cargamos hasta 60 productos)</li><li>El comprador elige productos, pone cantidades y envía su pedido de cotización por WhatsApp, con su empresa y RUC</li><li>Ficha técnica descargable por producto</li><li>Optimizada para aparecer en Google cuando buscan "EPP en Lima"</li><li>Lista en 10 a 14 días</li></ul><a class="btn btn-y" href="catalogo/">Ver la opción B</a></div>
</div>
<p style="margin-top:26px;color:var(--muted);font-size:15px">Pago: 50% para empezar y 50% al publicar, por Yape o Plin. Dominio propio aparte (aprox. S/ 60 al año). Garantía: si no entregamos lo acordado, devolvemos el 100%.<br>Franco Valladares · SV WebStudio · +51 957 636 046 · <a href="https://sv-web-studio.vercel.app/">sv-web-studio.vercel.app</a></p>
</div></section></body></html>'''
open(os.path.join(D, 'index.html'), 'w').write(idx)
print('ok')
