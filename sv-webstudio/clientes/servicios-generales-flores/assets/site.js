(function () {
  var WA = '51907335502';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Animación al hacer scroll
  var rv = $$('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  // Contadores
  $$('[data-count]').forEach(function (el) {
    var end = +el.getAttribute('data-count'), suf = el.getAttribute('data-suf') || '', done = false;
    var run = function () {
      if (done) return; done = true;
      var t0 = performance.now(), d = 1300;
      (function tick(t) {
        var p = Math.min(1, (t - t0) / d), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = v + suf; if (p < 1) requestAnimationFrame(tick);
      })(t0);
    };
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { run(); o.disconnect(); } }).observe(el);
    else run();
  });

  // Filtros de la galería
  var fbtns = $$('.filters button');
  fbtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f');
      fbtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      $$('.gal button').forEach(function (g) { g.hidden = !(f === 'all' || g.getAttribute('data-cat') === f); });
    });
  });

  // Visor de fotos
  var lb = $('.lb');
  if (lb) {
    var img = $('img', lb), cap = $('.cap', lb), list = [], i = 0;
    var show = function () { img.src = list[i].getAttribute('data-src'); img.alt = list[i].getAttribute('data-cap') || ''; cap.textContent = (list[i].getAttribute('data-cap') || '') + '  ·  ' + (i + 1) + ' / ' + list.length; };
    var open = function (btn) { list = $$('.gal button').filter(function (b) { return !b.hidden; }); i = list.indexOf(btn); show(); lb.classList.add('open'); document.body.style.overflow = 'hidden'; };
    var close = function () { lb.classList.remove('open'); document.body.style.overflow = ''; };
    var go = function (d) { i = (i + d + list.length) % list.length; show(); };
    $$('.gal button').forEach(function (b) { b.addEventListener('click', function () { open(b); }); });
    $('.x', lb).addEventListener('click', close);
    $('.pv', lb).addEventListener('click', function () { go(-1); });
    $('.nx', lb).addEventListener('click', function () { go(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); sx = null; });
  }

  // Video: se carga solo al tocar
  var vb = $('.vbox button');
  if (vb) vb.addEventListener('click', function () {
    var id = vb.getAttribute('data-yt');
    vb.parentNode.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Video de Servicios Generales Flores"></iframe>';
  });

  // Cotizador
  var q = $('#cotizador-form');
  if (q) {
    var st = { svc: [], inm: '', m2: 20, dist: '', when: '', name: '', det: '', otro: '' };
    var svcTxt = function () { return st.svc.map(function (s) { return s === 'Otros' && st.otro ? 'Otros (' + st.otro + ')' : s; }).join(', '); };
    var steps = $$('.qstep', q), cur = 0, bar = $('.qprog i', q);
    var sum = {
      svc: $('#s-svc'), inm: $('#s-inm'), m2: $('#s-m2'), dist: $('#s-dist'), when: $('#s-when')
    };
    var paint = function () {
      sum.svc.textContent = st.svc.length ? svcTxt() : '—';
      sum.inm.textContent = st.inm || '—';
      sum.m2.textContent = st.m2 ? 'Aprox. ' + st.m2 + ' m²' : '—';
      sum.dist.textContent = st.dist || '—';
      sum.when.textContent = st.when || '—';
    };
    var goStep = function (n) {
      cur = n; steps.forEach(function (s, k) { s.classList.toggle('on', k === n); });
      bar.style.width = ((n + 1) / steps.length * 100) + '%';
      $('.back', q).style.visibility = n ? 'visible' : 'hidden';
      $('.next', q).hidden = n === steps.length - 1;
      $('.send', q).hidden = n !== steps.length - 1;
      check();
    };
    var check = function () {
      var ok = [st.svc.length > 0, !!st.inm, !!st.dist && !!st.when, true][cur];
      $('.next', q).disabled = !ok; $('.next', q).style.opacity = ok ? 1 : .45;
    };
    $$('[data-svc]', q).forEach(function (c) {
      c.addEventListener('click', function () {
        var v = c.getAttribute('data-svc'), k = st.svc.indexOf(v);
        if (k < 0) st.svc.push(v); else st.svc.splice(k, 1);
        c.setAttribute('aria-pressed', k < 0 ? 'true' : 'false');
        if (v === 'Otros') { $('#q-otro-box').hidden = k >= 0; if (k < 0) $('#q-otro').focus(); }
        paint(); check();
      });
    });
    $$('[data-one]', q).forEach(function (c) {
      c.addEventListener('click', function () {
        var key = c.getAttribute('data-one');
        $$('[data-one="' + key + '"]', q).forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        st[key] = c.getAttribute('data-v'); paint(); check();
      });
    });
    var rng = $('#q-m2'), out = $('#q-m2-out');
    rng.addEventListener('input', function () { st.m2 = +rng.value; out.textContent = rng.value + ' m²'; paint(); });
    $('#q-dist').addEventListener('change', function (e) { st.dist = e.target.value; paint(); check(); });
    $('#q-otro').addEventListener('input', function (e) { st.otro = e.target.value.trim(); paint(); });
    $('#q-name').addEventListener('input', function (e) { st.name = e.target.value.trim(); });
    $('#q-det').addEventListener('input', function (e) { st.det = e.target.value.trim(); });
    $('.next', q).addEventListener('click', function () { if (cur < steps.length - 1) goStep(cur + 1); });
    $('.back', q).addEventListener('click', function () { if (cur > 0) goStep(cur - 1); });
    $('.send', q).addEventListener('click', function () {
      var lines = [
        'Hola, Servicios Generales Flores. Quiero una cotización' + (st.name ? ' (soy ' + st.name + ')' : '') + ':',
        '• Trabajo: ' + svcTxt(),
        '• Inmueble: ' + st.inm,
        '• Área aproximada: ' + st.m2 + ' m²',
        '• Distrito: ' + st.dist,
        '• ¿Para cuándo?: ' + st.when
      ];
      if (st.det) lines.push('• Detalle: ' + st.det);
      lines.push('Les envío fotos del espacio por aquí.');
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
    paint(); goStep(0);
  }

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
