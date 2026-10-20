(function () {
  var b = document.querySelector('.mb'), m = document.getElementById('menu');
  function set(o) { m.classList.toggle('open', o); b.setAttribute('aria-expanded', String(o)); if (!o) closeSubs(); }
  function closeSubs(keep) {
    document.querySelectorAll('.has.open').forEach(function (li) {
      if (li !== keep) { li.classList.remove('open'); li.querySelector('.sb').setAttribute('aria-expanded', 'false'); }
    });
  }
  if (b && m) b.addEventListener('click', function () { set(b.getAttribute('aria-expanded') !== 'true'); });
  document.querySelectorAll('.sb').forEach(function (s) {
    s.addEventListener('click', function () {
      var li = s.parentNode, o = !li.classList.contains('open');
      closeSubs(li); li.classList.toggle('open', o); s.setAttribute('aria-expanded', String(o));
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.has')) closeSubs(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var o = document.querySelector('.has.open');
    if (o) { var s = o.querySelector('.sb'); closeSubs(); s.focus(); return; }
    if (b && m && b.getAttribute('aria-expanded') === 'true') { set(false); b.focus(); }
  });
  // Header fijo: en escritorio se oculta la fila superior (logo y accesos) y queda solo la navegación
  var hd = document.querySelector('.hd'), nv = hd && hd.querySelector('.nav'), dk = matchMedia('(min-width:1200px)');
  function hdTop() {
    var t = dk.matches ? nv.offsetTop - 10 : 0;
    hd.style.top = -t + 'px';
    document.documentElement.style.scrollPaddingTop = (hd.offsetHeight - t + 16) + 'px';
    document.documentElement.style.setProperty('--hv', (hd.offsetHeight - t) + 'px');
  }
  // Botón discreto para volver arriba
  var up = document.createElement('button');
  up.type = 'button'; up.className = 'up'; up.setAttribute('aria-label', 'Volver arriba');
  up.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
  up.addEventListener('click', function () {
    scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  document.body.appendChild(up);
  function onScroll() {
    if (hd) hd.classList.toggle('st', scrollY > 4);
    up.classList.toggle('on', scrollY > 400);
  }
  if (hd && nv) { hdTop(); addEventListener('resize', hdTop); addEventListener('load', hdTop); }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  document.querySelectorAll('.car-b').forEach(function (g) {
    var t = document.getElementById(g.dataset.t), bs = g.querySelectorAll('.cb');
    if (!t) return;
    var red = matchMedia('(prefers-reduced-motion: reduce)');
    var upd = function () { bs[0].disabled = t.scrollLeft <= 2; bs[1].disabled = t.scrollLeft >= t.scrollWidth - t.clientWidth - 2; };
    bs.forEach(function (x) {
      x.addEventListener('click', function () {
        var w = t.children[0].offsetWidth + parseFloat(getComputedStyle(t).columnGap);
        t.scrollBy({ left: x.dataset.d * 2 * w, behavior: red.matches ? 'auto' : 'smooth' });
      });
    });
    t.addEventListener('scroll', upd, { passive: true });
    addEventListener('resize', upd);
    upd();
  });
  // Carrusel de banners: autoavance cada 4 s, con pausa (manual, al pasar el mouse o al enfocar)
  document.querySelectorAll('.bnr').forEach(function (c) {
    var t = c.querySelector('.bt'), sl = t.children, dw = c.querySelector('.bd2'), p = c.querySelector('.bp');
    var red = matchMedia('(prefers-reduced-motion: reduce)'), cur = 0, user = red.matches, hold = false, tm;
    var dots = Array.prototype.map.call(sl, function (s, i) {
      var d = document.createElement('button');
      d.type = 'button'; d.setAttribute('aria-label', 'Ir al banner ' + (i + 1));
      d.addEventListener('click', function () { go(i); });
      dw.appendChild(d); return d;
    });
    function go(i) {
      i = (i + sl.length) % sl.length;
      t.scrollTo({ left: i * t.clientWidth, behavior: red.matches ? 'auto' : 'smooth' });
    }
    function mark() {
      cur = Math.round(t.scrollLeft / t.clientWidth);
      dots.forEach(function (d, i) { d.setAttribute('aria-current', String(i === cur)); });
    }
    function play() {
      clearInterval(tm);
      if (!user && !hold) tm = setInterval(function () { go(cur + 1); }, 4000);
    }
    function setUser(o) {
      user = o; p.classList.toggle('off', o);
      p.setAttribute('aria-label', o ? 'Reanudar carrusel' : 'Pausar carrusel'); play();
    }
    c.querySelectorAll('[data-d]').forEach(function (b) {
      b.addEventListener('click', function () { go(cur + +b.dataset.d); play(); });
    });
    p.addEventListener('click', function () { setUser(!user); });
    c.addEventListener('mouseenter', function () { hold = true; play(); });
    c.addEventListener('mouseleave', function () { hold = false; play(); });
    c.addEventListener('focusin', function () { hold = true; play(); });
    c.addEventListener('focusout', function (e) { if (!c.contains(e.relatedTarget)) { hold = false; play(); } });
    document.addEventListener('visibilitychange', function () { hold = document.hidden; play(); });
    t.addEventListener('scroll', mark, { passive: true });
    addEventListener('resize', function () { t.scrollLeft = cur * t.clientWidth; });
    setUser(user); mark();
  });
  // Trámites: filtro por texto y modalidad, contadores por categoría y apertura por enlace (#permiso)
  var cat = document.querySelector('.cat');
  if (cat && document.getElementById('q2')) {
    var q = document.getElementById('q2'), rc = document.getElementById('rc'), nr = document.getElementById('nr');
    var fb = cat.querySelectorAll('.mf button'), secs = cat.querySelectorAll('.tc'), mod = '';
    var norm = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
    var rows = Array.prototype.map.call(cat.querySelectorAll('.tr'), function (d) { return { d: d, k: norm(d.textContent) }; });
    var link = function (s) { return cat.querySelector('.cn a[href="#' + s.id + '"]'); };
    function filtrar() {
      var ws = norm(q.value).trim().split(/\s+/).filter(Boolean), tot = 0;
      rows.forEach(function (r) {
        var m = r.d.dataset.mod, ok = (!mod || m === mod || m === 'mixto') && ws.every(function (w) { return r.k.indexOf(w) > -1; });
        r.d.hidden = !ok; if (ok) tot++;
      });
      secs.forEach(function (s) {
        var n = s.querySelectorAll('.tr:not([hidden])').length, a = link(s);
        s.hidden = !n; a.querySelector('b').textContent = n; a.parentNode.classList.toggle('z', !n);
      });
      rc.textContent = tot === rows.length ? tot + ' trámites' : tot + ' de ' + rows.length + ' trámites';
      nr.hidden = tot > 0;
    }
    function limpiar() { q.value = ''; mod = ''; fb.forEach(function (b) { b.setAttribute('aria-pressed', String(!b.dataset.f)); }); filtrar(); }
    q.addEventListener('input', filtrar);
    fb.forEach(function (b) {
      b.addEventListener('click', function () {
        mod = b.dataset.f; fb.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); filtrar();
      });
    });
    document.getElementById('nr-x').addEventListener('click', function () { limpiar(); q.focus(); });
    // Si el destino de un enlace quedó oculto por el filtro, se limpian los filtros antes de ir
    cat.querySelectorAll('.cn a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function () { var s = document.querySelector(a.getAttribute('href')); if (s && s.hidden) limpiar(); });
    });
    function abrir() {
      var t = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!t || !t.classList.contains('tr')) return;
      if (t.hidden) limpiar();
      t.open = true; t.scrollIntoView();
    }
    addEventListener('hashchange', abrir);
    abrir();
    // Marca en el menú la categoría que se está viendo
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          secs.forEach(function (s) { link(s).setAttribute('aria-current', String(s === e.target)); });
        });
      }, { rootMargin: '-35% 0px -60% 0px' });
      secs.forEach(function (s) { io.observe(s); });
    }
  }
  // Departamentos: el ancla (#daf o #daf-docs) muestra solo esa ficha; sin ancla se ve el directorio con buscador
  var dps = document.querySelector('.dps');
  if (dps) {
    var html = document.documentElement, dir = document.querySelector('.dir'), deps = dps.querySelectorAll('.dp'), t0 = document.title;
    var nrm = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
    function ruta() {
      var t = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1))), d = t && t.closest('.dp');
      html.classList.toggle('vd', !!d);
      deps.forEach(function (x) { x.classList.toggle('sel', x === d); });
      dps.querySelectorAll('.cn li a').forEach(function (a) { a.setAttribute('aria-current', String(!!d && a.getAttribute('href') === '#' + d.id)); });
      document.title = d ? d.dataset.t + ' | Municipalidad de Combarbalá' : t0;
      // En móvil el carril de chips se desplaza hasta el departamento activo
      var ul = dps.querySelector('.cn ul'), cur = ul.querySelector('[aria-current=true]');
      if (cur) ul.scrollLeft += cur.getBoundingClientRect().left - ul.getBoundingClientRect().left - 16;
      if (d && t !== d) t.scrollIntoView(); else scrollTo(0, 0);
    }
    addEventListener('hashchange', ruta);
    ruta();
    var q3 = document.getElementById('q3'), cards = dir.querySelectorAll('.dc');
    var ks = Array.prototype.map.call(cards, function (c) { return nrm(c.textContent + ' ' + c.dataset.k); });
    q3.addEventListener('input', function () {
      var ws = nrm(q3.value).trim().split(/\s+/).filter(Boolean), n = 0;
      cards.forEach(function (c, i) {
        var ok = ws.every(function (w) { return ks[i].indexOf(w) > -1; });
        c.hidden = !ok; if (ok) n++;
      });
      document.getElementById('rc3').textContent = n === cards.length ? n + ' departamentos' : n + ' de ' + cards.length + ' departamentos';
      document.getElementById('nr3').hidden = n > 0;
    });
    // Centro documental: filtros por año y categoría
    dps.querySelectorAll('.dfil').forEach(function (f) {
      var tb = document.getElementById(f.dataset.t), ss = f.querySelectorAll('select'), e = tb.querySelector('.dt-e');
      function filtrarDocs() {
        var n = 0;
        tb.querySelectorAll('tr[data-y]').forEach(function (r) {
          var ok = (!ss[0].value || r.dataset.y === ss[0].value) && (!ss[1].value || r.dataset.c === ss[1].value);
          r.hidden = !ok; if (ok) n++;
        });
        e.hidden = n > 0;
      }
      ss.forEach(function (s) { s.addEventListener('change', filtrarDocs); });
    });
  }
})();
