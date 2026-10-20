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
  // Fichas emergentes de los accesos rápidos del header (horario y transparencia); sin JS, el enlace lleva a su página
  var EXT = ' <span class="sr">(sitio externo)</span>';
  var FICHAS = {
    horario: { t: 'Horario de atención', c:
      '<ul class="ci"><li><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/></svg></span><span><small>Lunes a jueves</small>8:30 a 17:30 h</span></li>' +
      '<li><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/></svg></span><span><small>Viernes</small>8:30 a 16:30 h</span></li>' +
      '<li><span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/></svg></span><span><small>Dirección</small>Plaza de Armas Nro. 438, Combarbalá</span></li></ul>' +
      '<div class="vb"><a class="btn" href="tel:+56532655500">Llamar al 53 2655500</a><a class="btn ol" href="https://www.google.com/maps/search/?api=1&amp;query=Plaza+de+Armas+438%2C+Combarbal%C3%A1" rel="noopener">Cómo llegar' + EXT + '</a></div>' +
      '<p class="fch-m"><a href="contacto.html#horario">Ver todos los datos de contacto</a></p>' },
    transparencia: { t: 'Transparencia', c:
      '<p>Accede directamente a la información pública de la municipalidad:</p><ul class="lk">' +
      '<li><a href="https://www.portaltransparencia.cl/PortalPdT/pdtta?codOrganismo=MU060" rel="noopener">Transparencia Activa' + EXT + '</a></li>' +
      '<li><a href="https://www.portaltransparencia.cl/PortalPdT/ingreso-sai-v2?idOrgTa=MU060" rel="noopener">Solicitud de acceso a la información' + EXT + '</a></li>' +
      '<li><a href="https://www.leylobby.gob.cl/instituciones/MU060" rel="noopener">Ley de Lobby' + EXT + '</a></li></ul>' +
      '<div class="vb"><a class="btn" href="transparencia.html">Ir a Transparencia y participación</a></div>' }
  };
  var dlg = null;
  function ficha(k, origen) {
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'fch'; dlg.setAttribute('aria-labelledby', 'fch-t');
      dlg.innerHTML = '<div class="fch-h"><h2 id="fch-t"></h2><button type="button" class="fch-x" aria-label="Cerrar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="fch-b"></div>';
      dlg.querySelector('.fch-x').addEventListener('click', function () { dlg.close(); });
      // Clic fuera de la ficha (en el fondo) la cierra
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener('close', function () { if (dlg.origen) dlg.origen.focus(); });
      document.body.appendChild(dlg);
    }
    dlg.querySelector('#fch-t').textContent = FICHAS[k].t;
    dlg.querySelector('.fch-b').innerHTML = FICHAS[k].c;
    dlg.origen = origen;
    dlg.showModal();
  }
  if (window.HTMLDialogElement) document.querySelectorAll('[data-ficha]').forEach(function (a) {
    a.addEventListener('click', function (e) { if (FICHAS[a.dataset.ficha]) { e.preventDefault(); ficha(a.dataset.ficha, a); } });
  });
  // Búsqueda en todo el sitio (buscar.html?q=): lee las páginas y busca en trámites, departamentos, noticias, teléfonos, documentos y secciones
  var res = document.getElementById('res');
  if (res) {
    var PAGS = ['index.html', 'tramites.html', 'departamentos.html', 'noticias.html', 'noticia.html', 'contacto.html', 'transparencia.html', 'cultura-turismo.html', 'comuna.html', 'autoridades.html', 'privacidad.html'];
    var qs = (new URLSearchParams(location.search).get('q') || '').trim(), qin = document.getElementById('q-sitio'), rcs = document.getElementById('rc-sitio');
    var nb = function (s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
    var txt = function (el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; };
    qin.value = qs;
    var extraer = function (u, d) {
      var it = [], add = function (tipo, t, de, url, k) { if (t) it.push({ tipo: tipo, t: t, d: de, u: url, k: nb(t + ' ' + de + ' ' + k) }); };
      var main = d.querySelector('main');
      if (u !== 'noticia.html') add('Página', d.title.replace(/ \| Municipalidad de Combarbalá$/, ''), (d.querySelector('meta[name=description]') || {}).content || '', u, '');
      d.querySelectorAll('details.tr').forEach(function (x) { add('Trámite', txt(x.querySelector('summary b')), txt(x.querySelector('summary small')), u + '#' + x.id, txt(x)); });
      d.querySelectorAll('section.dp').forEach(function (x) { add('Departamento', txt(x.querySelector('h2')), txt(x.querySelector('.ban p')), u + '#' + x.id, txt(x)); });
      if (u === 'noticias.html') d.querySelectorAll('[itemtype$="NewsArticle"]').forEach(function (x) {
        var a = x.querySelector('[itemprop=url], h3 a');
        add('Noticia', txt(x.querySelector('[itemprop=headline]')), txt(x.querySelector('time')) + ' · ' + txt(x.querySelector('[itemprop=description]')), a ? a.getAttribute('href') : 'noticias.html', txt(x.querySelector('[itemprop=articleSection]')));
      });
      if (u === 'noticia.html') add('Noticia', txt(d.querySelector('h1')), txt(d.querySelector('.ent')), u, txt(d.querySelector('[itemprop=articleBody]')));
      d.querySelectorAll('tr[data-c]').forEach(function (x) { var c = x.cells; add('Teléfono', txt(c[0].firstChild), txt(c[2]) + ' · ' + txt(c[0].querySelector('small')), u + '#telefonos', txt(x)); });
      d.querySelectorAll('.dt tbody tr:not([data-c]):not(.dt-e)').forEach(function (x) { var a = x.querySelector('a'); if (a) add('Documento', txt(x.cells[0]), txt(x.cells[1]) + ' · ' + txt(x.cells[2]), a.getAttribute('href'), ''); });
      if (main && !/^(tramites|departamentos|noticias|noticia|buscar)\.html$/.test(u)) main.querySelectorAll('section[id], h2[id]').forEach(function (x) {
        if (x.tagName === 'H2' && x.closest('section[id]')) return;
        var h = x.tagName === 'H2' ? x : x.querySelector('h2, h3'), p = x.tagName === 'H2' ? x.nextElementSibling : x.querySelector('p');
        add('Sección', txt(h), txt(p).slice(0, 160), u + '#' + x.id, txt(x.tagName === 'H2' ? x.parentNode : x));
      });
      return it;
    };
    var marcar = function (el, s, ws) {
      // Resalta las palabras buscadas creando nodos de texto y <mark>, sin innerHTML
      var n = nb(s), i = 0, re = new RegExp(ws.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|'), 'g'), m;
      while (ws.length && (m = re.exec(n))) {
        if (!m[0]) break;
        el.appendChild(document.createTextNode(s.slice(i, m.index)));
        var mk = document.createElement('mark'); mk.textContent = s.slice(m.index, m.index + m[0].length); el.appendChild(mk);
        i = m.index + m[0].length;
      }
      el.appendChild(document.createTextNode(s.slice(i)));
    };
    if (qs.length >= 2) {
      document.title = 'Resultados para «' + qs + '» | Municipalidad de Combarbalá';
      rcs.textContent = 'Buscando…';
      Promise.all(PAGS.map(function (u) {
        return fetch(u).then(function (r) { return r.text(); }).then(function (h) { return extraer(u, new DOMParser().parseFromString(h, 'text/html')); });
      })).then(function (todos) {
        var ws = nb(qs).split(/\s+/).filter(Boolean), vistos = {}, out = [];
        [].concat.apply([], todos).forEach(function (r) {
          if (!ws.every(function (w) { return r.k.indexOf(w) > -1; })) return;
          var clave = r.tipo + '|' + r.t + '|' + r.u; if (vistos[clave]) return; vistos[clave] = 1;
          var nt = nb(r.t), nd = nb(r.d);
          r.p = ws.reduce(function (a, w) { return a + (nt.indexOf(w) > -1 ? 3 : 0) + (nd.indexOf(w) > -1 ? 1 : 0); }, 0) + (r.tipo === 'Página' ? 0 : 1);
          out.push(r);
        });
        out.sort(function (a, b) { return b.p - a.p; });
        out.slice(0, 40).forEach(function (r) {
          var li = document.createElement('li'), tg = document.createElement('span'), h = document.createElement('h3'), a = document.createElement('a'), p = document.createElement('p'), u = document.createElement('p');
          tg.className = 'tag'; tg.textContent = r.tipo;
          a.href = r.u; marcar(a, r.t, ws); h.appendChild(a);
          marcar(p, r.d, ws); u.className = 'meta'; u.textContent = r.u.split('#')[0];
          if (/^https?:/.test(r.u)) { a.rel = 'noopener'; u.textContent = 'Sitio externo o documento'; }
          li.className = 'panel'; li.append(tg, h); if (r.d) li.appendChild(p); li.appendChild(u); res.appendChild(li);
        });
        rcs.textContent = out.length ? out.length + (out.length === 1 ? ' resultado' : ' resultados') + ' para «' + qs + '»' + (out.length > 40 ? '; se muestran los 40 más relevantes' : '') : '';
        document.getElementById('nr-sitio').hidden = out.length > 0;
      }).catch(function () { rcs.textContent = 'No se pudo hacer la búsqueda. Abre el sitio desde un servidor web (por ejemplo, GitHub Pages o Live Server).'; });
    } else if (qs) { rcs.textContent = 'Escribe al menos 2 letras para buscar.'; }
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
