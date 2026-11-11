(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var IO = 'IntersectionObserver' in window;

  // Aparición al hacer scroll
  var rv = $$('.rv');
  if (IO) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  // Contadores
  $$('[data-count]').forEach(function (el) {
    var end = +el.getAttribute('data-count'), pre = el.getAttribute('data-pre') || '', suf = el.getAttribute('data-suf') || '';
    var run = function () {
      var t0 = performance.now(), d = 1400;
      (function tick(t) {
        var p = Math.min(1, (t - t0) / d), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = pre + v + suf; if (p < 1) requestAnimationFrame(tick);
      })(t0);
    };
    if (IO) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: .6 }).observe(el); else run();
  });

  // Antes / después
  $$('.ba').forEach(function (ba) {
    var input = $('input', ba), after = $('.after', ba), bar = $('.bar', ba), knob = $('.knob', ba);
    var set = function (v) { after.style.clipPath = 'inset(0 0 0 ' + v + '%)'; bar.style.left = v + '%'; knob.style.left = v + '%'; };
    input.addEventListener('input', function () { set(input.value); });
    set(input.value);
  });

  // Visor de fotos
  var lb = $('.lb');
  if (lb) {
    var img = $('img', lb), cap = $('.cap', lb), list = $$('.gal button'), i = 0;
    var show = function () { img.src = list[i].getAttribute('data-src'); img.alt = list[i].getAttribute('data-cap'); cap.textContent = list[i].getAttribute('data-cap') + '  ·  ' + (i + 1) + ' / ' + list.length; };
    var close = function () { lb.classList.remove('open'); document.body.style.overflow = ''; };
    var go = function (d) { i = (i + d + list.length) % list.length; show(); };
    list.forEach(function (b, k) { b.addEventListener('click', function () { i = k; show(); lb.classList.add('open'); document.body.style.overflow = 'hidden'; }); });
    $('.x', lb).addEventListener('click', close);
    $('.pv', lb).addEventListener('click', function () { go(-1); });
    $('.nx', lb).addEventListener('click', function () { go(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); sx = null; });
  }

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
