#!/usr/bin/env python3
"""Genera las 3 páginas de la propuesta para Servicios Generales Flores.

  index.html            → propuesta con las dos opciones
  web/index.html        → Opción A · Web corporativa · S/ 500
  cotizador/index.html  → Opción B · Web con cotizador y portafolio · S/ 800

Uso: python3 build.py
"""
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).parent
WA = '51907335502'
TEL = '+51907335502'
TEL_TXT = '907 335 502'
FRANCO_WA = '51957636046'
ADDR = 'Los Laureles 161 A, Vallecito Bajo, Villa María del Triunfo, Lima'
MAIL1 = 'cotizaciones@contratistasgeneralesflores.com'
MAIL2 = 'jorgeflores_1985@outlook.com'
YT = '3uKk5c3VZCE'


def wa(text):
    return f'https://wa.me/{WA}?text={quote(text)}'


def ic(name, cls=''):
    p = {
        'drop': '<path d="M12 2.7s-6 6.4-6 11a6 6 0 0 0 12 0c0-4.6-6-11-6-11z"/>',
        'zap': '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
        'layers': '<path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 12 10 5 10-5"/><path d="m2 17 10 5 10-5"/>',
        'brick': '<rect x="2" y="4" width="20" height="16" rx="1"/><path d="M2 9.3h20M2 14.7h20M8 4v5.3M16 4v5.3M12 9.3v5.4M8 14.7V20M16 14.7V20"/>',
        'grid': '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
        'brush': '<path d="M18.4 2.6a2 2 0 0 1 2.9 2.9L11 15.9 8.1 13 18.4 2.6z"/><path d="M8 13c-2.5 0-4 1.6-4 4 0 1.4-.6 2.5-2 3 3.6.9 8 .2 8-4"/>',
        'home': '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/><path d="M10 21v-6h4v6"/>',
        'building': '<rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
        'phone': '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
        'mail': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
        'pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
        'clock': '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
        'check': '<path d="M20 6 9 17l-5-5"/>',
        'arrow': '<path d="M5 12h14M13 6l6 6-6 6"/>',
        'x': '<path d="M18 6 6 18M6 6l12 12"/>',
        'left': '<path d="m15 18-6-6 6-6"/>',
        'right': '<path d="m9 18 6-6-6-6"/>',
        'calc': '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h4"/>',
        'camera': '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
        'play': '<path d="M6 4v16l14-8z" fill="currentColor"/>',
        'dots': '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
        'video': '<rect x="2" y="5" width="14" height="14" rx="2"/><path d="m22 8-6 4 6 4V8z"/>',
        'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
        'store': '<path d="M3 9 4.5 4h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6"/>',
        'office': '<rect x="3" y="7" width="18" height="14" rx="1"/><path d="M8 7V4h8v3M3 13h18"/>',
        'apt': '<rect x="5" y="2" width="14" height="20" rx="1"/><path d="M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01M10 22v-4h4v4"/>',
    }[name]
    return f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{p}</svg>'


WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2.1-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4z"/><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>'

SERVICES = [
    ('Gasfitería', 'drop', 'Instalación y reparación de tuberías, griferías, sanitarios y desagües.', 'gasfiteria'),
    ('Electricidad', 'zap', 'Instalaciones eléctricas, tableros, tomacorrientes e iluminación.', 'drywall-1'),
    ('Drywall', 'layers', 'Muros, techos, divisiones y muebles empotrados en drywall.', 'drywall-2'),
    ('Albañilería', 'brick', 'Muros, tarrajeo, contrapisos y trabajos de obra gruesa.', 'demolicion'),
    ('Enchapado de mayólicas', 'grid', 'Baños y cocinas con porcelanato, cerámica y mayólica.', 'bano-1'),
    ('Pintura', 'brush', 'Pintado de interiores y exteriores, con acabado limpio.', 'piso-4'),
    ('Remodelaciones y ampliaciones', 'home', 'Renovamos baños, cocinas, pisos y ambientes completos.', 'piso-6'),
    ('Obras civiles y construcción', 'building', 'Techos, estructuras y obras de construcción en general.', 'techo-1'),
]

# (archivo, categoría, texto)
GALLERY = [
    ('bano-1', 'banos', 'Baño con mampara de vidrio y mueble flotante'),
    ('piso-6', 'pisos', 'Piso de madera en sala con vista'),
    ('techo-1', 'techos', 'Estructura de techo en azotea'),
    ('bano-5', 'banos', 'Baño en mármol negro con iluminación LED'),
    ('drywall-1', 'drywall', 'Repisas de drywall con luz LED'),
    ('escalera', 'pisos', 'Escalera revestida en madera'),
    ('bano-13', 'banos', 'Baño terminado con revestimiento de madera'),
    ('granito', 'drywall', 'Tablero de granito en cocina'),
    ('piso-1', 'pisos', 'Pisos laminados terminados'),
    ('techo-4', 'techos', 'Techo de cochera'),
    ('bano-3', 'banos', 'Baño con mampara y muro oscuro'),
    ('mueble-1', 'drywall', 'Mueble empotrado a medida'),
    ('bano-4', 'banos', 'Mueble de baño blanco con lavatorio'),
    ('techo-2', 'techos', 'Pérgola de madera en azotea'),
    ('bano-7', 'banos', 'Mampara de vidrio esmerilado'),
    ('piso-4', 'pisos', 'Sala con piso nuevo'),
    ('techo-3', 'techos', 'Techo con estructura metálica'),
    ('bano-6', 'banos', 'Ducha con mampara y luz de pared'),
    ('bano-2', 'banos', 'Lavatorio de sobreponer y muro de madera'),
    ('bano-8', 'banos', 'Baño con piso gris'),
    ('piso-2', 'pisos', 'Lijado de piso de madera'),
    ('demolicion', 'obra', 'Demolición y retiro de desmonte'),
    ('piso-obra', 'obra', 'Instalación de piso'),
    ('piso-3', 'obra', 'Equipo instalando piso laminado'),
    ('bano-obra', 'obra', 'Baño en pleno enchapado'),
    ('bano-9', 'obra', 'Enchapado de baño'),
    ('drywall-2', 'obra', 'Trabajo de drywall'),
    ('gasfiteria', 'obra', 'Cambio de tuberías'),
]
CATS = [('all', 'Todos'), ('banos', 'Baños'), ('pisos', 'Pisos y madera'), ('drywall', 'Drywall y muebles'), ('techos', 'Techos y estructuras'), ('obra', 'En obra')]

FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Barlow:wght@400;500;600;700&display=swap" rel="stylesheet">'


def head(title, desc, base):
    return f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0b1650">
<link rel="icon" href="{base}img/logo.png">
{FONTS}
<link rel="stylesheet" href="{base}assets/site.css">
</head>'''


def demo_bar(label):
    return f'''<div class="demo-bar"><div class="wrap"><span>Muestra preparada por SV WebStudio · <b>{label}</b></span><a href="../">Ver las dos opciones</a></div></div>'''


def header(base, extra_nav=''):
    return f'''<header class="hdr"><div class="wrap">
  <a class="brand" href="#inicio" aria-label="Servicios Generales Flores, inicio"><img src="{base}img/logo.png" alt="Servicios Generales Flores" width="68" height="50"></a>
  <nav class="nav"><a href="#servicios">Servicios</a><a href="#trabajos">Trabajos</a>{extra_nav}<a href="#nosotros">Nosotros</a><a href="#contacto">Contacto</a></nav>
  <a class="btn btn-wa" href="{wa('Hola, quiero cotizar un trabajo.')}" target="_blank" rel="noopener">{WA_SVG}<span class="lbl">Cotizar por WhatsApp</span></a>
</div></header>'''


def trust():
    return '''<section class="trust"><div class="wrap">
  <div><b>+12 años</b><span>de experiencia</span></div>
  <div><b>24 horas</b><span>de atención</span></div>
  <div><b>Lima y Callao</b><span>atendemos toda la ciudad</span></div>
  <div><b>100%</b><span>mano de obra calificada</span></div>
</div></section>'''


def gallery(base, items, filters=False):
    out = []
    if filters:
        out.append('<div class="filters" role="toolbar" aria-label="Filtrar trabajos">' + ''.join(
            f'<button type="button" data-f="{k}" aria-pressed="{"true" if k == "all" else "false"}">{v}</button>' for k, v in CATS) + '</div>')
    out.append('<div class="gal">')
    for n, (f, c, t) in enumerate(items):
        cls = ' class="wide"' if n in (0,) else (' class="tall"' if n in (3, 10) else '')
        label = dict(CATS)[c]
        out.append(f'<button type="button"{cls} data-cat="{c}" data-src="{base}img/{f}.webp" data-cap="{t}" aria-label="Ver foto: {t}"><img src="{base}img/{f}.webp" alt="{t}" loading="lazy"><span>{label}</span></button>')
    out.append('</div>')
    out.append(f'''<div class="lb" role="dialog" aria-modal="true" aria-label="Foto ampliada"><button class="x" type="button" aria-label="Cerrar">{ic('x')}</button><button class="pv" type="button" aria-label="Anterior">{ic('left')}</button><img alt=""><button class="nx" type="button" aria-label="Siguiente">{ic('right')}</button><div class="cap"></div></div>''')
    return '\n'.join(out)


def about(base):
    return f'''<section class="sec" id="nosotros"><div class="wrap about">
  <div class="pic rv"><img src="{base}img/piso-5.webp" alt="Equipo de Servicios Generales Flores instalando un piso" loading="lazy"><div class="badge"><b>+12</b>años de<br>experiencia</div></div>
  <div class="rv">
    <span class="eyebrow dark">Quiénes somos</span>
    <h2>Especialistas en acabados de construcción</h2>
    <p>En Servicios Generales Flores trabajamos con profesionales capacitados y con experiencia en el mercado. Atendemos todo Lima y Callao.</p>
    <p>Nuestro personal es 100% mano de obra calificada de la localidad, y cada trabajo se hace con la seguridad adecuada y siguiendo los estándares de calidad.</p>
    <ul class="checks">
      <li>{ic('check')}Trabajamos con seguridad y cuidamos el medio ambiente</li>
      <li>{ic('check')}Cumplimos las normas y reglamentos vigentes</li>
      <li>{ic('check')}Respetamos los costos y plazos acordados</li>
      <li>{ic('check')}Garantizamos la calidad de nuestros servicios</li>
    </ul>
  </div>
</div></section>'''


def band(text, sub, btn_href, btn_txt):
    return f'''<section class="band"><div class="wrap">
  <div><h2>{text}</h2><p>{sub}</p></div>
  <a class="btn btn-navy" href="{btn_href}" target="_blank" rel="noopener">{WA_SVG}{btn_txt}</a>
</div></section>'''


def contact():
    map_q = quote('Los Laureles 161, Vallecito Bajo, Villa María del Triunfo, Lima')
    return f'''<section class="sec" id="contacto"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow dark">Contacto</span><h2>Hablemos de su obra</h2><p>Escríbanos por WhatsApp o llámenos. Atendemos las 24 horas.</p></div>
  <div class="contact">
    <div class="cinfo rv">
      <a class="citem" href="{wa('Hola, quiero cotizar un trabajo.')}" target="_blank" rel="noopener"><span class="ic" style="background:#e7f8ee;color:#128c4a">{WA_SVG}</span><span><small>WhatsApp</small><span style="font-weight:600;color:var(--navy)">{TEL_TXT}</span></span></a>
      <a class="citem" href="tel:{TEL}"><span class="ic">{ic('phone')}</span><span><small>Llámenos</small><span style="font-weight:600;color:var(--navy)">{TEL_TXT}</span></span></a>
      <div class="citem"><span class="ic">{ic('mail')}</span><span><small>Correo</small><a href="mailto:{MAIL1}">{MAIL1}</a><a href="mailto:{MAIL2}">{MAIL2}</a></span></div>
      <div class="citem"><span class="ic">{ic('pin')}</span><span><small>Dirección</small><p>{ADDR}</p></span></div>
      <div class="citem"><span class="ic">{ic('clock')}</span><span><small>Horario</small><p>Atención las 24 horas</p></span></div>
    </div>
    <div class="map rv"><iframe title="Mapa: Servicios Generales Flores" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q={map_q}&output=embed"></iframe></div>
  </div>
</div></section>'''


def footer(base, label):
    return f'''<footer class="ftr"><div class="wrap">
  <div><a class="brand" href="#inicio"><img src="{base}img/logo.png" alt="Servicios Generales Flores" width="76" height="56"></a><p style="margin-top:14px;max-width:340px">Acabados de construcción y servicios generales en Lima y Callao. Más de 12 años de experiencia.</p></div>
  <div><p style="color:#fff;font-weight:700;margin-bottom:8px">Servicios</p><p>Gasfitería · Electricidad · Drywall · Albañilería · Mayólicas · Pintura · Remodelaciones · Obras civiles</p></div>
  <div><p style="color:#fff;font-weight:700;margin-bottom:8px">Contacto</p><p><a href="tel:{TEL}">{TEL_TXT}</a></p><p><a href="mailto:{MAIL1}">{MAIL1}</a></p><p>Villa María del Triunfo, Lima</p></div>
  <p class="small">© <span data-year>2026</span> Servicios Generales Flores · {label}, preparada por SV WebStudio</p>
</div></footer>
<a class="fab" href="{wa('Hola, quiero cotizar un trabajo.')}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp al {TEL_TXT}">{WA_SVG}</a>
<script src="{base}assets/site.js" defer></script>
</body>
</html>'''


# ---------------- Opción A ----------------
def page_a():
    b = '../'
    svc = ''.join(f'''<article class="svc rv"><div class="ic">{ic(i)}</div><h3>{t}</h3><p>{d}</p><a href="{wa(f'Hola, quiero cotizar un trabajo de {t.lower()}.')}" target="_blank" rel="noopener">Cotizar {ic('arrow')}</a></article>''' for t, i, d, _ in SERVICES)
    sel = [g for g in GALLERY if g[0] in ('bano-1', 'piso-6', 'bano-5', 'drywall-1', 'escalera', 'techo-1', 'bano-13', 'granito', 'mueble-1', 'bano-3', 'techo-2', 'piso-1')]
    # el primero ancho
    sel.sort(key=lambda g: 0 if g[0] == 'piso-6' else 1)
    return f'''{head('Servicios Generales Flores · Acabados de construcción en Lima', 'Acabados de construcción y servicios generales en Lima y Callao: gasfitería, electricidad, drywall, mayólicas, pintura y remodelaciones. Atención 24 horas.', b)}
<body>
{demo_bar('Opción A · Web corporativa · S/ 500')}
{header(b)}
<main id="inicio">
<section class="hero-a"><div class="wrap">
  <div>
    <span class="eyebrow">Acabados de construcción · Lima y Callao</span>
    <h1>Remodelamos su espacio con <mark>acabados de calidad</mark></h1>
    <p class="lead">Baños, pisos, drywall, electricidad y gasfitería. Más de 12 años de experiencia y atención las 24 horas en todo Lima y Callao.</p>
    <div class="cta-row">
      <a class="btn btn-wa" href="{wa('Hola, quiero cotizar un trabajo.')}" target="_blank" rel="noopener">{WA_SVG}Cotizar por WhatsApp</a>
      <a class="btn btn-ghost" href="tel:{TEL}">{ic('phone')}Llamar al {TEL_TXT}</a>
    </div>
  </div>
  <div class="photo"><img src="{b}img/bano-1.webp" alt="Baño remodelado por Servicios Generales Flores" fetchpriority="high"><div class="float-card"><span class="dot"></span><span><b>24 horas</b>Le respondemos por WhatsApp</span></div></div>
</div></section>
{trust()}
<section class="sec" id="servicios"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow dark">Nuestros servicios</span><h2>Todo para su obra, con un solo equipo</h2><p>Desde una reparación de gasfitería hasta la remodelación completa de su casa.</p></div>
  <div class="svc-grid">{svc}</div>
</div></section>
<section class="sec" id="trabajos" style="background:#fff"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow dark">Nuestros trabajos</span><h2>Obras que ya entregamos</h2><p>Fotos reales de nuestros proyectos. Toque cualquiera para verla en grande.</p></div>
  {gallery(b, sel)}
</div></section>
{about(b)}
{band('¿Tiene una obra en mente?', 'Mándenos fotos y medidas por WhatsApp y le enviamos su cotización.', wa('Hola, quiero cotizar un trabajo. Les envío fotos y medidas.'), 'Pedir cotización')}
{contact()}
</main>
{footer(b, 'Opción A')}'''


# ---------------- Opción B ----------------
def page_b():
    b = '../'
    svc = ''.join(f'''<article class="svc-photo rv"><img src="{b}img/{im}.webp" alt="{t}" loading="lazy"><h3>{t}</h3><p>{d}</p><a href="#cotizador">Cotizar</a></article>''' for t, i, d, im in SERVICES)
    chips_svc = ''.join(f'<button type="button" class="chip" data-svc="{t}" aria-pressed="false">{ic(i)}{t}</button>' for t, i, _, _ in SERVICES) + f'<button type="button" class="chip" data-svc="Otros" aria-pressed="false">{ic("dots")}Otros</button>'
    inm = [('Casa', 'home'), ('Departamento', 'apt'), ('Oficina', 'office'), ('Local comercial', 'store'), ('Otro', 'dots')]
    chips_inm = ''.join(f'<button type="button" class="chip" data-one="inm" data-v="{t}" aria-pressed="false">{ic(i)}{t}</button>' for t, i in inm)
    when = ['Lo antes posible', 'En las próximas semanas', 'Solo estoy cotizando']
    chips_when = ''.join(f'<button type="button" class="chip" data-one="when" data-v="{t}" aria-pressed="false">{ic("clock")}{t}</button>' for t in when)
    dists = ['Villa María del Triunfo', 'San Juan de Miraflores', 'Villa El Salvador', 'Chorrillos', 'Santiago de Surco', 'Barranco', 'Miraflores', 'San Isidro', 'San Borja', 'La Molina', 'Surquillo', 'Lince', 'Jesús María', 'Pueblo Libre', 'Magdalena del Mar', 'San Miguel', 'Cercado de Lima', 'Breña', 'La Victoria', 'Ate', 'Santa Anita', 'San Juan de Lurigancho', 'Los Olivos', 'San Martín de Porres', 'Comas', 'Independencia', 'Pachacámac', 'Lurín', 'Callao', 'Otro distrito']
    opts = '<option value="">Elija su distrito</option>' + ''.join(f'<option>{d}</option>' for d in dists)
    zones = ''.join(f'<span>{z}</span>' for z in ['Villa María del Triunfo', 'San Juan de Miraflores', 'Surco', 'Chorrillos', 'Miraflores', 'San Borja', 'La Molina', 'Lima Cercado', 'Los Olivos', 'Callao', 'y todo Lima'])
    steps = [
        ('demolicion', 'Cuéntenos qué necesita', 'Use el cotizador o escríbanos por WhatsApp con fotos y medidas del espacio.'),
        ('piso-obra', 'Reciba su presupuesto', 'Le enviamos el costo y el plazo del trabajo, claros y por escrito.'),
        ('bano-obra', 'Ejecutamos la obra', 'Nuestro equipo trabaja con seguridad, orden y en los plazos acordados.'),
        ('bano-1', 'Entregamos el acabado', 'Revisamos juntos el resultado final antes de terminar.'),
    ]
    steps_html = ''.join(f'<article class="step rv"><div class="im"><img src="{b}img/{im}.webp" alt="{t}" loading="lazy"></div><div class="tx"><h3>{t}</h3><p>{d}</p></div></article>' for im, t, d in steps)
    faqs = [
        ('¿En qué distritos trabajan?', 'Atendemos todo Lima y Callao. Nuestra base está en Villa María del Triunfo.'),
        ('¿Cómo pido una cotización?', 'Complete el cotizador de esta página o escríbanos por WhatsApp al 907 335 502 con fotos y medidas del espacio. Con eso le preparamos su presupuesto.'),
        ('¿Atienden urgencias?', 'Sí. Atendemos las 24 horas, por ejemplo para fugas de agua o problemas eléctricos.'),
        ('¿Hacen trabajos pequeños?', 'Sí. Hacemos desde reparaciones puntuales de gasfitería o electricidad hasta remodelaciones completas.'),
    ]
    faq_html = ''.join(f'<details class="rv"><summary>{q}</summary><p>{a}</p></details>' for q, a in faqs)
    return f'''{head('Servicios Generales Flores · Remodelaciones y acabados en Lima', 'Acabados de construcción y remodelaciones en Lima y Callao. Cotice su obra en línea y envíela por WhatsApp. Atención 24 horas.', b)}
<body class="has-mbar">
{demo_bar('Opción B · Web con cotizador y portafolio · S/ 800')}
{header(b, '<a href="#cotizador">Cotizar</a>')}
<main id="inicio">
<section class="hero-b"><img src="{b}img/hero.webp" alt="Baño en mármol negro terminado por Servicios Generales Flores" fetchpriority="high">
  <div class="wrap">
    <span class="eyebrow">Acabados de construcción · Lima y Callao</span>
    <h1>Su obra, <mark>bien hecha</mark> y a tiempo</h1>
    <p class="lead">Baños, pisos, drywall, electricidad, gasfitería y remodelaciones completas. Cotice en un minuto y reciba su presupuesto por WhatsApp.</p>
    <div class="cta-row">
      <a class="btn btn-gold" href="#cotizador">{ic('calc')}Cotizar mi obra</a>
      <a class="btn btn-ghost" href="tel:{TEL}">{ic('phone')}{TEL_TXT}</a>
    </div>
    <div class="stats">
      <div><b data-count="12" data-suf="+">12+</b><span>años de experiencia</span></div>
      <div><b data-count="24" data-suf=" h">24 h</b><span>de atención</span></div>
      <div><b data-count="8">8</b><span>especialidades</span></div>
    </div>
  </div>
</section>
<section class="sec" id="servicios"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow dark">Nuestros servicios</span><h2>Un solo equipo para toda su obra</h2><p>Elija un servicio y cotícelo en segundos.</p></div>
  <div class="svc-grid">{svc}</div>
</div></section>
<section class="sec quote" id="cotizador"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow">Cotizador en línea</span><h2>Cotice su obra en 1 minuto</h2><p>Responda 4 preguntas y su pedido llega listo a nuestro WhatsApp. Ahí mismo nos manda las fotos.</p></div>
  <div class="qbox">
    <form class="qcard" id="cotizador-form" onsubmit="return false">
      <div class="qprog" aria-hidden="true"><i></i></div>
      <div class="qstep"><h3>1. ¿Qué trabajo necesita?</h3><p class="hint">Puede elegir varios.</p><div class="chips">{chips_svc}</div>
        <div class="field" id="q-otro-box" hidden style="margin-top:14px"><label for="q-otro">¿Qué otro trabajo necesita?</label><input id="q-otro" type="text" placeholder="Ej.: impermeabilizar el techo o instalar una puerta"></div></div>
      <div class="qstep"><h3>2. ¿Dónde es el trabajo?</h3><p class="hint">Elija el tipo de inmueble.</p><div class="chips c4">{chips_inm}</div>
        <div class="field" style="margin-top:18px"><label for="q-m2">Área aproximada</label><div class="range"><input id="q-m2" type="range" min="2" max="300" step="1" value="20"><output id="q-m2-out">20 m²</output></div></div></div>
      <div class="qstep"><h3>3. Distrito y fecha</h3><p class="hint">Atendemos todo Lima y Callao.</p>
        <div class="field"><label for="q-dist">Distrito</label><select id="q-dist">{opts}</select></div>
        <div class="field"><label>¿Para cuándo lo necesita?</label><div class="chips" style="grid-template-columns:1fr">{chips_when}</div></div></div>
      <div class="qstep"><h3>4. Sus datos</h3><p class="hint">Opcional, pero nos ayuda a responderle mejor.</p>
        <div class="field"><label for="q-name">Su nombre</label><input id="q-name" type="text" autocomplete="name" placeholder="Ej.: Carmen Rojas"></div>
        <div class="field"><label for="q-det">Cuéntenos un poco más</label><textarea id="q-det" rows="3" placeholder="Ej.: quiero cambiar el piso de la sala y enchapar el baño"></textarea></div></div>
      <div class="qnav"><button type="button" class="back">← Atrás</button><button type="button" class="btn btn-navy next">Siguiente {ic('arrow')}</button><button type="button" class="btn btn-wa send" hidden>{WA_SVG}Enviar por WhatsApp</button></div>
    </form>
    <aside class="qsum rv"><h4>{ic("calc")}Su pedido</h4><dl><dt>Trabajo</dt><dd id="s-svc">—</dd><dt>Inmueble</dt><dd id="s-inm">—</dd><dt>Área</dt><dd id="s-m2">—</dd><dt>Distrito</dt><dd id="s-dist">—</dd><dt>Para</dt><dd id="s-when">—</dd></dl>
      <p class="note">{ic('camera')}<span>Al enviarlo se abre WhatsApp con su pedido escrito. Adjunte fotos del espacio y le cotizamos más rápido.</span></p></aside>
  </div>
</div></section>
<section class="sec" id="trabajos" style="background:#fff"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow dark">Portafolio</span><h2>Nuestros trabajos</h2><p>{len(GALLERY)} fotos reales de obras entregadas y en proceso. Filtre por tipo de trabajo.</p></div>
  {gallery(b, GALLERY, filters=True)}
</div></section>
<section class="sec"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow dark">Cómo trabajamos</span><h2>De su mensaje a la obra terminada</h2></div>
  <div class="steps">{steps_html}</div>
</div></section>
<section class="sec" style="background:var(--paper-2)"><div class="wrap video">
  <div class="vbox rv"><img src="{b}img/piso-3.webp" alt="Equipo de Servicios Generales Flores instalando un piso" loading="lazy"><div class="vph"><span class="vtag">{ic('video')}Muestra</span><div><b>Aquí va el video de su equipo en obra</b><p>En la web final ponemos un video corto de sus trabajos, grabado con su celular.</p></div></div></div>
  <div class="rv"><span class="eyebrow dark">En obra</span><h2 style="font-size:clamp(34px,5vw,52px);color:var(--navy);margin:10px 0 14px">Véanos trabajando</h2><p style="color:var(--muted)">Así trabaja nuestro equipo en cada proyecto: con orden, seguridad y cuidado en cada acabado.</p>
    <p style="color:var(--navy);font-weight:700;margin-top:22px">Zonas de atención</p><div class="zones">{zones}</div></div>
</div></section>
{about(b)}
<section class="sec" style="background:#fff"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow dark">Preguntas frecuentes</span><h2>Antes de empezar</h2></div>
  <div class="faq">{faq_html}</div>
</div></section>
{band('¿Listo para empezar su obra?', 'Cotice en un minuto o escríbanos directo. Atendemos las 24 horas.', wa('Hola, quiero cotizar un trabajo.'), 'Escribir por WhatsApp')}
{contact()}
</main>
<nav class="mbar" aria-label="Acciones rápidas"><a href="tel:{TEL}">{ic('phone')}Llamar</a><a class="wa" href="{wa('Hola, quiero cotizar un trabajo.')}" target="_blank" rel="noopener">{WA_SVG}WhatsApp</a><a class="q" href="#cotizador">{ic('calc')}Cotizar</a></nav>
{footer(b, 'Opción B')}'''


# ---------------- Propuesta ----------------
def page_index():
    b = ''
    pick_a = f'https://wa.me/{FRANCO_WA}?text=' + quote('Hola Franco, soy Jorge de Servicios Generales Flores. Me quedo con la opción A (S/ 500).')
    pick_b = f'https://wa.me/{FRANCO_WA}?text=' + quote('Hola Franco, soy Jorge de Servicios Generales Flores. Me quedo con la opción B (S/ 800).')
    li = lambda xs: ''.join(f'<li>{ic("check")}<span>{x}</span></li>' for x in xs)
    a_items = ['Diseño nuevo, rápido y hecho para el celular', 'WhatsApp y teléfono que llaman al 907 335 502 con un toque', '8 servicios con botón de cotizar cada uno', 'Galería de 12 fotos de sus obras', 'Quiénes somos, contacto, correos y mapa de Villa María del Triunfo', 'Preparada para aparecer en Google']
    b_items = ['Todo lo de la opción A', '<b>Cotizador en línea:</b> el cliente elige el trabajo, el inmueble, el área y el distrito, y le llega el pedido listo a su WhatsApp', '<b>Portafolio de 28 fotos</b> con filtros (baños, pisos, drywall, techos, en obra)', 'Portada a pantalla completa con animaciones', 'Sección “Cómo trabajamos”, espacio para el video de su equipo en obra y preguntas frecuentes', 'Barra fija en el celular: Llamar · WhatsApp · Cotizar']
    return f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="robots" content="noindex, nofollow">
<title>Propuesta web · Servicios Generales Flores</title><meta name="theme-color" content="#0b1650"><link rel="icon" href="img/logo.png">{FONTS}<link rel="stylesheet" href="assets/site.css">
<style>
.pz{{background:var(--navy);color:#fff;padding:40px 0 120px;position:relative;overflow:hidden}}
.pz::before{{content:"";position:absolute;width:640px;height:640px;right:-240px;top:-260px;border-radius:50%;background:radial-gradient(circle,rgba(245,179,1,.22),transparent 65%)}}
.pz .top{{display:flex;align-items:center;gap:14px;margin-bottom:34px}}
.pz .top img{{height:58px;background:#fff;border-radius:12px;padding:5px}}
.pz .top small{{display:block;color:#9ea6d6;font-size:13px;letter-spacing:.12em;text-transform:uppercase;font-weight:600}}
.pz .top b{{font-family:"Barlow Condensed";font-size:24px;text-transform:uppercase}}
.pz h1{{font-size:clamp(40px,7vw,72px);max-width:820px}}
.pz h1 mark{{background:none;color:var(--gold)}}
.pz p.lead{{color:#c9cff0;font-size:19px;max-width:640px;margin-top:14px}}
.alert{{margin-top:22px;display:flex;gap:12px;align-items:flex-start;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);border-radius:14px;padding:14px 16px;max-width:640px;font-size:15.5px;color:#e5e8fb}}
.alert b{{color:var(--gold)}}
.alert svg{{flex:none;width:22px;height:22px;color:var(--gold);margin-top:2px}}
.opts{{display:grid;gap:18px;margin-top:-80px;position:relative}}
.opt{{background:#fff;border-radius:var(--r-lg);overflow:hidden;box-shadow:0 30px 60px -30px rgba(11,22,80,.45);display:flex;flex-direction:column;border:2px solid transparent}}
.opt.rec{{border-color:var(--gold)}}
.opt .shot{{aspect-ratio:16/9;overflow:hidden;position:relative;background:var(--paper-2)}}
.opt .shot img{{width:100%;height:100%;object-fit:cover;transition:transform .6s}}
.opt:hover .shot img{{transform:scale(1.04)}}
.opt .tag{{position:absolute;left:14px;top:14px;background:var(--gold);color:var(--gold-ink);font-weight:800;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;padding:6px 12px;border-radius:999px}}
.opt .bd{{padding:22px;display:flex;flex-direction:column;gap:14px;flex:1}}
.opt .k{{font-weight:700;color:var(--navy-3);letter-spacing:.12em;text-transform:uppercase;font-size:13px}}
.opt h2{{font-size:34px;color:var(--navy)}}
.price{{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}}
.price b{{font-family:"Barlow Condensed";font-weight:800;font-size:54px;line-height:1;color:var(--navy)}}
.price span{{color:var(--muted);font-weight:600}}
.opt ul{{list-style:none;display:grid;gap:9px;flex:1}}
.opt li{{display:flex;gap:10px;font-size:15.5px;color:var(--ink)}}
.opt li svg{{flex:none;width:20px;height:20px;color:#128c4a;margin-top:2px}}
.opt .acts{{display:grid;gap:10px}}
.terms{{margin:40px 0 0;display:grid;gap:12px}}
.terms div{{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:16px 18px;display:flex;gap:12px;align-items:flex-start}}
.terms svg{{flex:none;width:24px;height:24px;color:var(--navy-3)}}
.terms b{{color:var(--navy)}}
@media(min-width:900px){{.opts{{grid-template-columns:1fr 1fr}}.terms{{grid-template-columns:repeat(3,1fr)}}.opt .acts{{grid-template-columns:1fr 1fr}}}}
</style></head>
<body>
<section class="pz"><div class="wrap">
  <div class="top"><img src="img/logo.png" alt="Servicios Generales Flores"><div><small>Propuesta de SV WebStudio para</small><b>Servicios Generales Flores</b></div></div>
  <h1>Su nueva web, con el <mark>WhatsApp funcionando</mark> y sus obras a la vista</h1>
  <p class="lead">Preparamos dos versiones con sus propias fotos y datos. Ábralas desde su celular y elija la que más le guste.</p>
  <div class="alert">{ic('phone')}<span>En su web actual, el botón de WhatsApp y el número del pie llevan al <b>965 179 417</b>. En las dos opciones, todo llama y escribe a su <b>907 335 502</b>.</span></div>
</div></section>
<main class="wrap" style="padding-bottom:70px">
  <div class="opts">
    <article class="opt"><a class="shot" href="web/"><img src="img/bano-1.webp" alt="Vista de la opción A"></a><div class="bd">
      <span class="k">Opción A</span><h2>Web corporativa</h2>
      <div class="price"><b>S/ 500</b><span>pago único · o S/ 99 al mes</span></div>
      <ul>{li(a_items)}</ul>
      <p style="color:var(--muted);font-size:14.5px">Lista en 7 a 10 días.</p>
      <div class="acts"><a class="btn btn-navy" href="web/">Ver la muestra {ic('arrow')}</a><a class="btn btn-wa" href="{pick_a}" target="_blank" rel="noopener">{WA_SVG}Elegir A</a></div>
    </div></article>
    <article class="opt rec"><a class="shot" href="cotizador/"><img src="img/hero.webp" alt="Vista de la opción B"><span class="tag">Recomendada</span></a><div class="bd">
      <span class="k">Opción B</span><h2>Web con cotizador y portafolio</h2>
      <div class="price"><b>S/ 800</b><span>pago único</span></div>
      <ul>{li(b_items)}</ul>
      <p style="color:var(--muted);font-size:14.5px">Lista en 10 a 14 días. Es la que más pedidos de cotización trae: el cliente le escribe con todo lo que necesita.</p>
      <div class="acts"><a class="btn btn-navy" href="cotizador/">Ver la muestra {ic('arrow')}</a><a class="btn btn-wa" href="{pick_b}" target="_blank" rel="noopener">{WA_SVG}Elegir B</a></div>
    </div></article>
  </div>
  <div class="terms">
    <div>{ic('shield')}<span><b>Garantía:</b> si no le entregamos lo acordado, le devolvemos el 100%.</span></div>
    <div>{ic('calc')}<span><b>Pago:</b> 50% para empezar y 50% cuando la web esté publicada y usted la apruebe. Por Yape o Plin.</span></div>
    <div>{ic('check')}<span><b>Incluye 3 rondas de cambios</b> y usamos su mismo dominio: contratistasgeneralesflores.com.</span></div>
  </div>
  <p style="text-align:center;color:var(--muted);margin-top:34px;font-size:15px">Franco Valladares · SV WebStudio · <a style="color:var(--navy);font-weight:700" href="https://wa.me/{FRANCO_WA}" target="_blank" rel="noopener">+51 957 636 046</a></p>
</main>
</body></html>'''


if __name__ == '__main__':
    (ROOT / 'web').mkdir(exist_ok=True)
    (ROOT / 'cotizador').mkdir(exist_ok=True)
    (ROOT / 'web' / 'index.html').write_text(page_a(), encoding='utf-8')
    (ROOT / 'cotizador' / 'index.html').write_text(page_b(), encoding='utf-8')
    (ROOT / 'index.html').write_text(page_index(), encoding='utf-8')
    print('ok')
