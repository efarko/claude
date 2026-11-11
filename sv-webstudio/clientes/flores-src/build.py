#!/usr/bin/env python3
"""Web final de FS Flores · Construcción y Drywall (Jorge Flores).

Genera ../servicios-generales-flores/index.html (más robots.txt y sitemap.xml).
Las fotos viven en ../servicios-generales-flores/img/ y se eligen en las listas de abajo.
Uso: python3 build.py
"""
import json
from pathlib import Path
from urllib.parse import quote

OUT = Path(__file__).resolve().parent.parent / 'servicios-generales-flores'

# ---------- Datos del negocio ----------
NAME = 'FS Flores'
FULL = 'FS Flores · Construcción y Drywall'
LEGAL = 'Servicios Generales Flores'
WA = '51907335502'
TEL = '+51907335502'
TEL_TXT = '907 335 502'
MAIL1 = 'cotizaciones@contratistasgeneralesflores.com'
MAIL2 = 'jorgeflores_1985@outlook.com'
ADDR = 'Los Laureles 161 A, Vallecito Bajo, Villa María del Triunfo, Lima'
TIKTOK = 'https://www.tiktok.com/@sgflores8'
INSTAGRAM = 'https://www.instagram.com/fs.flores0/'
SITE = 'https://www.contratistasgeneralesflores.com/'

# ---------- Fotos (archivo en img/ sin extensión .webp, texto) ----------
HERO = ('hero', 'Baño en mármol negro con iluminación LED terminado por FS Flores')
REEL = ['bano-1', 'piso-6', 'drywall-1', 'bano-5', 'escalera', 'techo-1', 'bano-13', 'granito', 'mueble-1', 'piso-1', 'bano-3', 'techo-2']
SERVICES = [  # (título, descripción, foto, clase del bento)
    ('Remodelación de baños', 'Enchapado, mamparas, muebles y gasfitería completa, de principio a fin.', 'bano-1', 'big'),
    ('Pisos y madera', 'Laminados, madera, porcelanato y revestimiento de escaleras.', 'piso-6', 'wide'),
    ('Drywall', 'Muros, techos, divisiones y muebles empotrados con luz LED.', 'drywall-1', ''),
    ('Gasfitería', 'Tuberías, griferías, sanitarios y fugas. Atención 24 horas.', 'gasfiteria', ''),
    ('Electricidad', 'Instalaciones, tableros, tomacorrientes e iluminación.', 'bano-5', ''),
    ('Pintura', 'Interiores y exteriores, con acabado limpio y parejo.', 'piso-4', ''),
    ('Albañilería y obras civiles', 'Muros, tarrajeo, contrapisos, techos y ampliaciones.', 'techo-1', 'wide'),
]
BEFORE_AFTER = None  # ('antes', 'despues', 'texto') cuando haya un par real de la misma obra
GALLERY = [
    ('bano-1', 'Baño con mampara y mueble flotante'), ('piso-6', 'Piso de madera en sala'), ('bano-5', 'Baño en mármol negro con LED'),
    ('drywall-1', 'Repisas de drywall con luz LED'), ('escalera', 'Escalera revestida en madera'), ('techo-1', 'Estructura de techo en azotea'),
    ('bano-13', 'Baño con revestimiento de madera'), ('granito', 'Tablero de granito en cocina'), ('mueble-1', 'Mueble empotrado a medida'),
    ('bano-3', 'Baño con mampara y muro oscuro'), ('piso-1', 'Pisos laminados terminados'), ('techo-2', 'Pérgola de madera en azotea'),
    ('bano-4', 'Mueble de baño blanco'), ('bano-6', 'Ducha con mampara de vidrio'), ('techo-4', 'Techo de cochera'), ('bano-7', 'Mampara de vidrio esmerilado'),
]
ABOUT_IMG = ('piso-5', 'Equipo de FS Flores instalando un piso')
FINAL_IMG = 'piso-6'


def wa(text):
    return f'https://wa.me/{WA}?text={quote(text)}'


I = {
    'arrow': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'phone': '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    'mail': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    'pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    'clock': '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    'camera': '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    'doc': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    'tool': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
    'map': '<path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4z"/><path d="M8 2v16M16 6v16"/>',
    'x': '<path d="M18 6 6 18M6 6l12 12"/>',
    'left': '<path d="m15 18-6-6 6-6"/>',
    'right': '<path d="m9 18 6-6-6-6"/>',
    'lr': '<path d="m9 18-6-6 6-6M15 6l6 6-6 6"/>',
}


def ic(n):
    return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{I[n]}</svg>'


WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2.1-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4z"/><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>'
TT_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.8 5.8 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z"/></svg>'
IG_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>'

DESC = 'Construcción, acabados y drywall en Lima y Callao: remodelación de baños, pisos, drywall, gasfitería, electricidad y pintura. Más de 12 años de experiencia y atención las 24 horas. Cotice por WhatsApp.'
TITLE = 'FS Flores · Construcción, acabados y drywall en Lima y Callao'
WA_MAIN = wa('Hola, vi su página web y quiero cotizar un trabajo.')


def img(n):
    return f'img/{n}.webp'


def head():
    ld = {
        '@context': 'https://schema.org', '@type': 'HomeAndConstructionBusiness',
        'name': FULL, 'alternateName': LEGAL, 'url': SITE, 'logo': SITE + 'img/logo-fs.png', 'image': SITE + 'img/og.jpg',
        'description': DESC, 'telephone': TEL, 'email': MAIL1,
        'address': {'@type': 'PostalAddress', 'streetAddress': 'Los Laureles 161 A, Vallecito Bajo', 'addressLocality': 'Villa María del Triunfo', 'addressRegion': 'Lima', 'addressCountry': 'PE'},
        'areaServed': ['Lima', 'Callao'],
        'openingHoursSpecification': {'@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 'opens': '00:00', 'closes': '23:59'},
        'sameAs': [TIKTOK, INSTAGRAM],
        'makesOffer': [{'@type': 'Offer', 'itemOffered': {'@type': 'Service', 'name': s[0]}} for s in SERVICES],
    }
    return f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{TITLE}</title>
<meta name="description" content="{DESC}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="{SITE}">
<meta name="theme-color" content="#06070b">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_PE">
<meta property="og:site_name" content="{FULL}">
<meta property="og:title" content="{TITLE}">
<meta property="og:description" content="{DESC}">
<meta property="og:url" content="{SITE}">
<meta property="og:image" content="{SITE}img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="img/favicon.png">
<link rel="apple-touch-icon" href="img/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..900&display=swap" rel="stylesheet">
<link rel="preload" as="image" href="{img(HERO[0])}">
<link rel="stylesheet" href="assets/style.css">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>'''


def page():
    top = ''.join(f'<span>{t}</span>' for t in ['Atención las 24 horas', 'Todo Lima y Callao', 'Cotización sin compromiso por WhatsApp', '+12 años de experiencia', 'Respetamos el presupuesto y los plazos'] * 2)
    reel = ''.join(f'<img src="{img(n)}" alt="" loading="lazy">' for n in REEL * 2)
    pains = [
        ('El maestro no llega o deja la obra a medias.', 'Cumplimos los plazos acordados', 'Le decimos cuándo empezamos y cuándo terminamos, y lo cumplimos.'),
        ('El presupuesto sube a mitad de la obra.', 'Respetamos el costo acordado', 'Le damos el presupuesto antes de empezar y trabajamos con él.'),
        ('A los meses, los acabados se ven mal.', 'Garantizamos la calidad', 'Mano de obra 100% calificada y materiales bien instalados.'),
        ('Hay una fuga de noche y nadie contesta.', 'Atención las 24 horas', 'Escríbanos o llámenos a cualquier hora al 907 335 502.'),
    ]
    pains_html = ''.join(f'<article class="pain rv d{k % 2}"><p class="no"><i>✕</i>{a}</p><p class="yes"><i>{ic("check")}</i><span>{b}<small>{c}</small></span></p></article>' for k, (a, b, c) in enumerate(pains))
    svc_html = ''.join(f'<article class="svc {cls} rv"><img src="{img(im)}" alt="{t}" loading="lazy"><span class="n">0{k + 1}</span><h3 class="h">{t}</h3><p>{d}</p><a href="{wa(f"Hola, vi su página web y quiero cotizar: {t.lower()}.")}" target="_blank" rel="noopener">Cotizar {ic("arrow")}</a></article>' for k, (t, d, im, cls) in enumerate(SERVICES))
    ba_html = ''
    if BEFORE_AFTER:
        a, b, t = BEFORE_AFTER
        ba_html = f'''<section class="sec" style="padding-top:0"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow">Antes y después</span><h2 class="h"><span class="silver">Deslice y vea</span> <span class="blue">la diferencia</span></h2><p>{t}</p></div>
  <div class="ba rv"><img src="{img(a)}" alt="Antes"><img class="after" src="{img(b)}" alt="Después"><span class="tag l">Antes</span><span class="tag r">Después</span><div class="bar"></div><div class="knob">{ic('lr')}</div><input type="range" min="0" max="100" value="50" aria-label="Comparar antes y después"></div>
</div></section>'''
    gal_html = ''.join(f'<button type="button" class="rv" data-src="{img(n)}" data-cap="{t}" aria-label="Ver foto: {t}"><img src="{img(n)}" alt="{t}" loading="lazy"><span>{t}</span></button>' for n, t in GALLERY)
    steps = [
        ('camera', 'Mándenos una foto', 'Por WhatsApp, con una foto del espacio y lo que quiere hacer. Le respondemos rápido, a cualquier hora.'),
        ('doc', 'Reciba su presupuesto', 'Claro y por escrito, con el costo y el plazo. Sin compromiso: usted decide.'),
        ('tool', 'Hacemos la obra', 'Con seguridad, orden y en el plazo acordado. Usted solo disfruta el resultado.'),
    ]
    steps_html = ''.join(f'<article class="step rv d{k}"><div class="ic">{ic(i)}</div><h3 class="h">{t}</h3><p>{d}</p></article>' for k, (i, t, d) in enumerate(steps))
    faqs = [
        ('¿Cómo pido una cotización?', 'Escríbanos por WhatsApp al 907 335 502 con una foto del espacio y lo que quiere hacer. Con eso le preparamos su presupuesto, sin compromiso.'),
        ('¿En qué distritos trabajan?', 'En todo Lima y Callao. Nuestra base está en Villa María del Triunfo.'),
        ('¿Atienden urgencias?', 'Sí. Atendemos las 24 horas, por ejemplo fugas de agua o problemas eléctricos.'),
        ('¿El presupuesto puede cambiar a mitad de obra?', 'Nuestro compromiso es respetar los costos y plazos acordados antes de empezar.'),
        ('¿Hacen trabajos pequeños?', 'Sí. Desde una reparación de gasfitería o electricidad hasta la remodelación completa de su casa.'),
    ]
    faq_html = ''.join(f'<details class="rv"><summary>{q}</summary><p>{a}</p></details>' for q, a in faqs)
    map_q = quote('Los Laureles 161, Vallecito Bajo, Villa María del Triunfo, Lima')
    return f'''{head()}
<body>
<div class="topbar" aria-hidden="true"><div class="track">{top}</div></div>
<header class="hdr"><div class="wrap">
  <a class="brand" href="#inicio" aria-label="{FULL}, inicio"><img src="img/logo-fs.png" alt="{FULL}" width="60" height="54"></a>
  <nav class="nav" aria-label="Principal"><a href="#servicios">Servicios</a><a href="#trabajos">Trabajos</a><a href="#como">Cómo trabajamos</a><a href="#nosotros">Nosotros</a><a href="#contacto">Contacto</a></nav>
  <a class="btn btn-wa" href="{WA_MAIN}" target="_blank" rel="noopener">{WA_SVG}<span class="lbl">Cotizar por WhatsApp</span></a>
</div></header>
<main id="inicio">

<section class="hero"><img src="{img(HERO[0])}" alt="{HERO[1]}" fetchpriority="high">
  <div class="wrap">
    <span class="eyebrow">Construcción · Acabados · Drywall</span>
    <h1 class="h"><span class="silver">Su casa como la imagina.</span><br><span class="blue">Terminada a tiempo.</span></h1>
    <p class="lead">Remodelamos baños, pisos y ambientes completos en todo Lima y Callao, con más de 12 años de experiencia. Mándenos una foto de su espacio y reciba su presupuesto sin compromiso.</p>
    <div class="cta">
      <a class="btn btn-wa" href="{WA_MAIN}" target="_blank" rel="noopener">{WA_SVG}Cotizar sin compromiso</a>
      <a class="btn btn-line" href="#trabajos">Ver obras terminadas {ic('arrow')}</a>
    </div>
    <div class="chips"><span>{ic('shield')}Calidad garantizada</span><span>{ic('clock')}Atención 24 horas</span><span>{ic('map')}Lima y Callao</span></div>
  </div>
  <span class="scroll-hint">DESLICE</span>
</section>

<div class="reel" aria-label="Fotos de nuestras obras"><div class="track">{reel}</div></div>

<section class="sec"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow">Sabemos lo que preocupa</span><h2 class="h"><span class="silver">Remodelar no tiene</span> <span class="blue">por qué ser un dolor de cabeza</span></h2><p>Estos son los problemas que más escuchamos de quienes ya pasaron por una mala experiencia. Así los resolvemos.</p></div>
  <div class="pains">{pains_html}</div>
</div></section>

<section class="sec" id="servicios" style="padding-top:20px"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow">Nuestros servicios</span><h2 class="h"><span class="silver">Un solo equipo</span> <span class="blue">para toda su obra</span></h2><p>Sin coordinar con cinco maestros distintos: nosotros nos encargamos de todo, del gasfitero al acabado final.</p></div>
  <div class="bento">{svc_html}</div>
</div></section>
{ba_html}
<section class="sec" id="trabajos" style="background:var(--bg-2)"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow">Obras terminadas</span><h2 class="h"><span class="silver">Así quedan</span> <span class="blue">nuestros trabajos</span></h2><p>Fotos reales de obras que entregamos en Lima. Toque cualquiera para verla en grande.</p></div>
  <div class="gal">{gal_html}</div>
  <div class="cta rv" style="justify-content:center;margin-top:34px"><a class="btn btn-wa" href="{wa('Hola, vi sus trabajos en la página web y quiero algo así para mi casa.')}" target="_blank" rel="noopener">{WA_SVG}Quiero algo así para mi casa</a></div>
  <div class="lb" role="dialog" aria-modal="true" aria-label="Foto ampliada"><button class="x" type="button" aria-label="Cerrar">{ic('x')}</button><button class="pv" type="button" aria-label="Anterior">{ic('left')}</button><img alt=""><button class="nx" type="button" aria-label="Siguiente">{ic('right')}</button><div class="cap"></div></div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="nums rv">
    <div><b class="h silver" data-count="12" data-pre="+">+12</b><span>años de experiencia</span></div>
    <div><b class="h silver" data-count="24" data-suf=" h">24 h</b><span>de atención, todos los días</span></div>
    <div><b class="h silver" data-count="7">7</b><span>especialidades en un solo equipo</span></div>
    <div><b class="h silver">100%</b><span>mano de obra calificada</span></div>
  </div>
</div></section>

<section class="sec light" id="como"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow">Cómo trabajamos</span><h2 class="h">Su obra en 3 pasos</h2><p>Empezar es tan fácil como mandar una foto. Sin visitas a ciegas ni presupuestos sorpresa.</p></div>
  <div class="steps">{steps_html}</div>
  <div class="cta rv" style="margin-top:34px"><a class="btn btn-wa" href="{WA_MAIN}" target="_blank" rel="noopener">{WA_SVG}Empezar ahora: mandar una foto</a></div>
</div></section>

<section class="sec" id="nosotros"><div class="wrap about">
  <div class="pic rv"><img src="{img(ABOUT_IMG[0])}" alt="{ABOUT_IMG[1]}" loading="lazy"><div class="badge"><b class="h">+12</b><span>años construyendo y remodelando en Lima y Callao</span></div></div>
  <div class="rv d1">
    <span class="eyebrow">Quiénes somos</span>
    <h2 class="h"><span class="silver">Especialistas en</span> <span class="blue">acabados de construcción</span></h2>
    <p>En FS Flores (Servicios Generales Flores) trabajamos con profesionales capacitados y con experiencia en el mercado. Nuestro personal es 100% mano de obra calificada de la localidad.</p>
    <p>Cada obra se hace con la seguridad adecuada, respetando las normas y siguiendo estándares de calidad, antes, durante y después del proyecto.</p>
    <ul class="checks">
      <li>{ic('check')}Cumplimos los costos y plazos acordados</li>
      <li>{ic('check')}Garantizamos la calidad de nuestros servicios</li>
      <li>{ic('check')}Trabajamos con seguridad y cuidamos el medio ambiente</li>
      <li>{ic('check')}Cumplimos las normas y reglamentos vigentes</li>
    </ul>
  </div>
</div></section>

<section class="sec" style="padding-top:0"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow">Síganos</span><h2 class="h"><span class="silver">Véanos trabajando</span> <span class="blue">cada semana</span></h2><p>Subimos nuestras obras en TikTok e Instagram. Ahí ve el avance real, de principio a fin.</p></div>
  <div class="social">
    <a class="soc rv" href="{TIKTOK}" target="_blank" rel="noopener"><span class="ic" style="background:#000;border:1px solid #333">{TT_SVG}</span><span><b>TikTok</b><span>@sgflores8 · videos de nuestras obras</span></span><span class="go">{ic('arrow')}</span></a>
    <a class="soc rv d1" href="{INSTAGRAM}" target="_blank" rel="noopener"><span class="ic" style="background:linear-gradient(45deg,#f9a825,#e91e63 55%,#7b1fa2)">{IG_SVG}</span><span><b>Instagram</b><span>@fs.flores0 · fotos de trabajos terminados</span></span><span class="go">{ic('arrow')}</span></a>
  </div>
</div></section>

<section class="sec light"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow">Preguntas frecuentes</span><h2 class="h">Antes de empezar</h2></div>
  <div class="faq">{faq_html}</div>
</div></section>

<section class="sec final"><img src="{img(FINAL_IMG)}" alt="" loading="lazy"><div class="wrap rv">
  <span class="eyebrow">Su próxima obra</span>
  <h2 class="h"><span class="silver">Una filtración o un baño viejo</span> <span class="blue">no se arreglan solos</span></h2>
  <p>Mientras más espera, más crece el problema. Mándenos una foto hoy y le decimos cuánto cuesta dejarlo como nuevo.</p>
  <div class="cta"><a class="btn btn-wa" href="{WA_MAIN}" target="_blank" rel="noopener">{WA_SVG}Cotizar por WhatsApp</a><a class="btn btn-line" href="tel:{TEL}">{ic('phone')}Llamar al {TEL_TXT}</a></div>
  <small>Cotización sin compromiso · Respondemos las 24 horas</small>
</div></section>

<section class="sec" id="contacto"><div class="wrap">
  <div class="sec-head rv"><span class="eyebrow">Contacto</span><h2 class="h"><span class="silver">Hablemos</span> <span class="blue">de su obra</span></h2><p>Escríbanos o llámenos. Atendemos las 24 horas.</p></div>
  <div class="contact">
    <div class="cinfo rv">
      <a class="citem" href="{WA_MAIN}" target="_blank" rel="noopener"><span class="ic" style="background:rgba(37,211,102,.12);color:#25d366">{WA_SVG}</span><span><small>WhatsApp</small><span class="v">{TEL_TXT}</span></span></a>
      <a class="citem" href="tel:{TEL}"><span class="ic">{ic('phone')}</span><span><small>Llámenos</small><span class="v">{TEL_TXT}</span></span></a>
      <div class="citem"><span class="ic">{ic('mail')}</span><span><small>Correo</small><a class="v" href="mailto:{MAIL1}">{MAIL1}</a><a class="v" href="mailto:{MAIL2}">{MAIL2}</a></span></div>
      <div class="citem"><span class="ic">{ic('pin')}</span><span><small>Dirección</small><span class="v">{ADDR}</span></span></div>
      <div class="citem"><span class="ic">{ic('clock')}</span><span><small>Horario</small><span class="v">Las 24 horas, todos los días</span></span></div>
    </div>
    <div class="map rv d1"><iframe title="Mapa: {FULL}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q={map_q}&output=embed"></iframe></div>
  </div>
</div></section>
</main>

<footer class="ftr"><div class="wrap">
  <div><img src="img/logo-fs.png" alt="{FULL}" width="78" height="70" loading="lazy"><p style="margin-top:14px;max-width:360px">Construcción, acabados y drywall en Lima y Callao. Más de 12 años de experiencia.</p>
    <div class="soc-row"><a href="{TIKTOK}" target="_blank" rel="noopener" aria-label="TikTok">{TT_SVG}</a><a href="{INSTAGRAM}" target="_blank" rel="noopener" aria-label="Instagram">{IG_SVG}</a><a href="{WA_MAIN}" target="_blank" rel="noopener" aria-label="WhatsApp">{WA_SVG}</a></div></div>
  <div><h4>Servicios</h4><p>Remodelación de baños · Pisos y madera · Drywall · Gasfitería · Electricidad · Pintura · Albañilería y obras civiles</p></div>
  <div><h4>Contacto</h4><p><a href="tel:{TEL}">{TEL_TXT}</a></p><p><a href="mailto:{MAIL1}">{MAIL1}</a></p><p>Villa María del Triunfo, Lima</p></div>
  <p class="small">© <span data-year>2026</span> {FULL} ({LEGAL}) · Página web: <a href="https://sv-web-studio.vercel.app/" target="_blank" rel="noopener">SV WebStudio</a></p>
</div></footer>

<a class="fab" href="{WA_MAIN}" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp al {TEL_TXT}">{WA_SVG}</a>
<nav class="mbar" aria-label="Contacto rápido"><a class="call" href="tel:{TEL}">{ic('phone')}Llamar</a><a class="wa" href="{WA_MAIN}" target="_blank" rel="noopener">{WA_SVG}Cotizar por WhatsApp</a></nav>
<script src="assets/app.js" defer></script>
</body>
</html>'''


if __name__ == '__main__':
    html = page()
    (OUT / 'index.html').write_text(html, encoding='utf-8')
    (OUT / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {SITE}sitemap.xml\n', encoding='utf-8')
    (OUT / 'sitemap.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>{SITE}</loc><changefreq>monthly</changefreq><priority>1.0</priority></url></urlset>\n', encoding='utf-8')
    import re
    missing = [f for f in set(re.findall(r'img/([\w.-]+\.(?:webp|png|jpg))', html)) if not (OUT / 'img' / f).exists()]
    print('ok', 'faltan: ' + ', '.join(sorted(missing)) if missing else '')
