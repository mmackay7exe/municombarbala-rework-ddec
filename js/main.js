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
  // Noticias: filtro por categoría, año y palabra clave (también desde la búsqueda del header, ?q=) y paginación de 6 en 6
  var nfl = document.querySelector('.nfl');
  if (nfl) {
    var nc = Array.prototype.slice.call(document.querySelectorAll('.nc')), POR = 6, pag = 1, vis = nc;
    var sc = document.getElementById('n-cat'), sy = document.getElementById('n-y'), q4 = document.getElementById('q4');
    var pg = document.getElementById('pg4'), rc4 = document.getElementById('rc4'), nr4 = document.getElementById('nr4');
    var nn = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
    var nk = nc.map(function (c) { return nn(c.textContent); });
    function pintar() {
      var np = Math.ceil(vis.length / POR);
      nc.forEach(function (c) { var i = vis.indexOf(c); c.hidden = i < 0 || Math.floor(i / POR) + 1 !== pag; });
      rc4.textContent = vis.length === nc.length ? '' : vis.length + ' de ' + nc.length + ' noticias';
      nr4.hidden = vis.length > 0;
      pg.hidden = np < 2; pg.innerHTML = '';
      function boton(txt, p, lbl) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = txt; b.setAttribute('aria-label', lbl);
        if (p === pag && txt === String(p)) b.setAttribute('aria-current', 'page');
        b.addEventListener('click', function () { pag = p; pintar(); document.getElementById('t-ult').scrollIntoView(); });
        pg.appendChild(b);
      }
      if (pag > 1) boton('‹ Anterior', pag - 1, 'Página anterior');
      for (var p = 1; p <= np; p++) boton(String(p), p, 'Página ' + p);
      if (pag < np) boton('Siguiente ›', pag + 1, 'Página siguiente');
    }
    function listar() {
      var ws = nn(q4.value).trim().split(/\s+/).filter(Boolean);
      vis = nc.filter(function (c, i) {
        return (!sc.value || c.dataset.c === sc.value) && (!sy.value || c.dataset.y === sy.value) && ws.every(function (w) { return nk[i].indexOf(w) > -1; });
      });
      pag = 1; pintar();
    }
    var u = new URLSearchParams(location.search);
    q4.value = u.get('q') || '';
    if (u.get('cat')) sc.value = u.get('cat');
    if (u.get('y')) sy.value = u.get('y');
    nfl.addEventListener('submit', function (e) { e.preventDefault(); listar(); });
    q4.addEventListener('input', listar);
    sc.addEventListener('change', listar);
    sy.addEventListener('change', listar);
    document.getElementById('nr4-x').addEventListener('click', function () { q4.value = ''; sc.value = ''; sy.value = ''; listar(); q4.focus(); });
    listar();
  }
  // Contacto: filtro de la agenda telefónica por texto y categoría
  var agd = document.getElementById('t-agd');
  if (agd) {
    var q5 = document.getElementById('q5'), rc5 = document.getElementById('rc5'), cat5 = '';
    var fb5 = document.querySelectorAll('.agd .mf button'), tr5 = agd.querySelectorAll('tr[data-c]'), e5 = agd.querySelector('.dt-e');
    var n5 = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
    var k5 = Array.prototype.map.call(tr5, function (r) { return n5(r.textContent); });
    function agenda() {
      var ws = n5(q5.value).trim().split(/\s+/).filter(Boolean), n = 0;
      tr5.forEach(function (r, i) {
        var ok = (!cat5 || r.dataset.c === cat5) && ws.every(function (w) { return k5[i].indexOf(w) > -1; });
        r.hidden = !ok; if (ok) n++;
      });
      rc5.textContent = n === tr5.length ? '' : n + ' de ' + tr5.length + ' contactos';
      e5.hidden = n > 0;
    }
    q5.addEventListener('input', agenda);
    fb5.forEach(function (b) {
      b.addEventListener('click', function () {
        cat5 = b.dataset.f; fb5.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); agenda();
      });
    });
  }
  // Contacto: validación con mensajes junto a cada campo; el formulario es una maqueta y no envía datos
  var fmc = document.getElementById('fm-con');
  if (fmc) {
    var intentado = false;
    var textos = {
      nombre: { valueMissing: 'Escribe tu nombre.', tooShort: 'El nombre debe tener al menos 3 letras.' },
      correo: { valueMissing: 'Escribe tu correo para poder responderte.', typeMismatch: 'Revisa el correo; por ejemplo: nombre@correo.cl.' },
      telefono: { patternMismatch: 'Usa solo números (y + si quieres), entre 8 y 16 caracteres.' },
      mensaje: { valueMissing: 'Cuéntanos tu consulta.', tooShort: 'El mensaje debe tener al menos 10 caracteres.' },
      consentimiento: { valueMissing: 'Para responderte necesitamos que aceptes el uso de tus datos.' }
    };
    var revisar = function (c) {
      var err = c.getAttribute('aria-describedby') && document.getElementById(c.getAttribute('aria-describedby').split(' ').pop());
      if (!err || !err.classList.contains('err')) return true;
      var v = c.validity, t = textos[c.name] || {}, msg = '';
      ['valueMissing', 'typeMismatch', 'tooShort', 'patternMismatch'].some(function (k) { if (v[k]) { msg = t[k] || 'Revisa este campo.'; return true; } });
      err.textContent = msg; err.hidden = !msg;
      if (msg) c.setAttribute('aria-invalid', 'true'); else c.removeAttribute('aria-invalid');
      return !msg;
    };
    var campos = fmc.querySelectorAll('input, textarea');
    // Tras el primer intento de envío, los errores se actualizan al salir de cada campo (no antes, para no apurar al usuario)
    campos.forEach(function (c) { c.addEventListener(c.type === 'checkbox' ? 'change' : 'blur', function () { if (intentado) revisar(c); }); });
    fmc.addEventListener('submit', function (e) {
      e.preventDefault(); intentado = true;
      var st = document.getElementById('fm-st'), malo = null;
      campos.forEach(function (c) { if (!revisar(c) && !malo) malo = c; });
      if (malo) { st.textContent = 'Revisa los campos marcados.'; malo.focus(); return; }
      st.textContent = 'Gracias, ' + fmc.nombre.value.trim().split(' ')[0] + '. Este formulario es una maqueta y el mensaje no se envió: para una respuesta llama a la mesa central, 53 2655500.';
      fmc.reset(); intentado = false;
    });
  }
  // Video incrustado: botón grande de reproducir sobre la portada (los controles nativos siguen disponibles)
  document.querySelectorAll('.vid video').forEach(function (v) {
    var w = document.createElement('div'), b = document.createElement('button');
    w.className = 'vw'; v.parentNode.insertBefore(w, v); w.appendChild(v);
    b.type = 'button'; b.className = 'vp';
    var tv = document.getElementById('t-vid');
    b.setAttribute('aria-label', 'Reproducir video' + (tv ? ': ' + tv.textContent.replace(/^Video:\s*/i, '') : ''));
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
    b.addEventListener('click', function () { v.play(); v.focus(); });
    v.addEventListener('play', function () { b.hidden = true; });
    v.addEventListener('pause', function () { b.hidden = false; });
    w.appendChild(b);
  });
})();
