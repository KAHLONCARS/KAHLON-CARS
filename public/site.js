(function () {
  var PHONE = '972539666010';
  var wa = function (text) { return 'https://wa.me/' + PHONE + (text ? '?text=' + encodeURIComponent(text) : ''); };
  var WA_ICO = '<svg class="wa-ico" viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.21-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.78a9.4 9.4 0 0 1 2.77 6.7c0 5.22-4.25 9.47-9.47 9.47zm8.06-17.53A11.33 11.33 0 0 0 12.05.63C5.77.63.66 5.74.66 12.02c0 2.01.52 3.97 1.52 5.7L.56 23.63l6.04-1.58a11.36 11.36 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.19-5.9-3.33-8.05z"/></svg>';
  var fmt = function (x) { return Math.round(x).toLocaleString('he-IL'); };
  var monthlyPay = function (loan, months, ratePct) {
    var r = ratePct / 100 / 12;
    if (loan <= 0) return 0;
    return r === 0 ? loan / months : loan * r / (1 - Math.pow(1 + r, -months));
  };

  // Menu (three lines)
  var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('menu');
  if (btn && menu) {
    btn.addEventListener('click', function () {
      var open = menu.hidden;
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
  }

  // Year in footer
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Finance calculator
  var calc = document.getElementById('calc');
  if (calc) {
    var $ = function (id) { return document.getElementById(id); };
    var yearSel = $('c-year');
    for (var yy = new Date().getFullYear(); yy >= 2014; yy--) {
      var o = document.createElement('option'); o.value = yy; o.textContent = yy; yearSel.appendChild(o);
    }
    var link = function (range, num) {
      range.addEventListener('input', function () { num.value = range.value; update(); });
      num.addEventListener('input', function () { update(); });
      num.addEventListener('change', function () { range.value = num.value; update(); });
    };
    link($('c-price-r'), $('c-price'));
    link($('c-down-r'), $('c-down'));
    $('c-months').addEventListener('input', update);
    $('c-rate').addEventListener('input', update);
    yearSel.addEventListener('change', update);
    function update() {
      var price = Math.max(25000, parseFloat($('c-price').value) || 0);
      var down = Math.min(price, Math.max(0, parseFloat($('c-down').value) || 0));
      var months = parseInt($('c-months').value, 10) || 60;
      var rate = Math.min(25, Math.max(0, parseFloat($('c-rate').value) || 0));
      $('c-down-r').max = price;
      var loan = price - down, m = monthlyPay(loan, months, rate), total = m * months;
      $('c-months-out').textContent = months + ' חודשים';
      $('c-monthly').textContent = fmt(m) + ' ₪';
      $('c-detail').textContent = '';
      var yr = yearSel.value;
      $('c-yearline').textContent = yr ? 'רכב משנת ' + yr : '';
      $('c-wa').href = wa('היי, אשמח להצעת מימון' + (window.__kcChosen ? ' ל' + window.__kcChosen : '') + (yr ? ' משנת ' + yr : '') + '. מחיר: ' + fmt(price) + ' ₪, מקדמה: ' + fmt(down) + ' ₪, ' + months + ' תשלומים (החזר משוער לפי האתר: ' + fmt(m) + ' ₪ לחודש).');
    }
    var chosen = '';
    try {
      var q = new URLSearchParams(location.search);
      var st = {}; try { st = JSON.parse(sessionStorage.getItem('kc-car') || '{}'); } catch (e2) {}
      var cp = q.get('price') || st.price, cy = q.get('year') || st.year; chosen = q.get('car') || st.car || '';
      if (cp) { $('c-price').value = cp; $('c-price-r').value = cp; }
      if (cy) { yearSel.value = cy; }
      if (chosen) { var box = $('c-chosen'); box.hidden = false; box.querySelector('b').textContent = chosen + (cy ? ' ' + cy : ''); }
    } catch (e) {}
    window.__kcChosen = chosen;
    update();
  }

  // ===== Cars: shared helpers =====
  var CARS = window.KAHLON_CARS || [];
  var esc = function (t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (ch) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]; }); };
  var canFin = function (c) { return !!(c.finance || c.year >= 2014); };
  var pics = function (c) { return c.photos || (c.photo ? [c.photo] : []); };
  var hasCat = function (c, cat) { return cat === 'budget' ? (c.price && c.price <= 20000) : (' ' + (c.cats || '') + ' ').indexOf(' ' + cat + ' ') > -1; };
  var carUrl = function (c) { return 'car.html?id=' + encodeURIComponent(c.id); };
  var msgFor = function (c) { return 'היי, אני מתעניין ב' + c.title + ' ' + c.year + ' שראיתי באתר. אפשר פרטים?'; };
  var isAuto = function (c) { return /אוטומט/.test((c.gear || '') + ' ' + (c.engine || '')); };
  var specList = function (c) {
    var o = c.year ? [['שנה', c.year]] : []; if (c.km) o.push(['ק״מ', fmt(c.km)]);
    if (c.hand) o.push(['יד', c.hand]);
    if (c.engine) o.push(['מנוע', c.engine]);
    if (c.gear) o.push(['גיר', c.gear]);
    if (c.test) o.push(['טסט', c.test]);
    if (c.trim) o.push(['גימור', c.trim]);
    return o;
  };
  var monthlyLine = function (c) {
    if (!canFin(c)) return '';
    return c.price ? 'החל מ־' + fmt(monthlyPay(c.price, 60, 7)) + ' ₪ לחודש*' : 'מימון עד 100%';
  };
  var gallery = function (c, big) {
    var p = pics(c);
    if (!p.length) return '<div class="gal"><div class="ph" aria-hidden="true"></div></div>';
    return '<div class="gal' + (big ? ' gal-big' : '') + '"><div class="slides">' +
      p.map(function (src, k) { return '<img class="ph" src="' + src + '" alt="' + esc(c.title + ' ' + c.year + ' – תמונה ' + (k + 1)) + '"' + (big && !k ? '' : ' loading="lazy"') + '>'; }).join('') +
      '</div>' + (p.length > 1 ? '<div class="dots">' + p.map(function (_, k) { return '<span' + (k ? '' : ' class="on"') + '></span>'; }).join('') + '</div>' +
      '<button class="nav prev" type="button" aria-label="תמונה קודמת">›</button><button class="nav next" type="button" aria-label="תמונה הבאה">‹</button>' : '') +
      (c.badge ? '<span class="badge">' + esc(c.badge) + '</span>' : '') +
      (!big && p.length > 1 ? '<span class="count">' + p.length + ' תמונות</span>' : '') + '</div>';
  };
  var card = function (c) {
    var m = monthlyLine(c);
    return '<article class="car">' + gallery(c) +
      '<a class="body" href="' + carUrl(c) + '">' +
      '<span class="brand-l">' + esc(c.brand || '') + (c.en ? ' · <span class="ltr">' + esc(c.en) + '</span>' : '') + '</span>' +
      '<h3>' + esc(c.title) + ' <span class="yr">' + c.year + '</span></h3>' +
      '<div class="specs">' + (c.km ? '<span>' + fmt(c.km) + ' ק״מ</span>' : '') + (c.hand ? '<span>יד ' + esc(c.hand) + '</span>' : '') + (c.gear ? '<span>' + esc(c.gear) + '</span>' : (c.engine ? '<span>' + esc(c.engine) + '</span>' : '')) + '</div>' +
      '<div class="pr-row"><div>' + (c.price ? '<div class="price">' + fmt(c.price) + ' ₪</div>' : '<div class="price price-ask">מחיר בטלפון</div>') +
      (m ? '<div class="monthly">' + m + '</div>' : '<div class="monthly muted">טרייד־אין אפשרי</div>') + '</div>' +
      '<span class="go">לפרטים ←</span></div></a></article>';
  };
  var wireGal = function (root) {
    root.querySelectorAll('.gal').forEach(function (g) {
      if (g.__w) return; g.__w = 1;
      var sl = g.querySelector('.slides'); if (!sl) return;
      var dots = g.querySelectorAll('.dots span');
      var idx = function () { return Math.round(Math.abs(sl.scrollLeft) / sl.clientWidth); };
      sl.addEventListener('scroll', function () { var k = idx(); dots.forEach(function (d, j) { d.className = j === k ? 'on' : ''; }); g.dispatchEvent(new CustomEvent('slide', { detail: k })); }, { passive: true });
      g.goTo = function (k) { sl.scrollTo({ left: -k * sl.clientWidth, behavior: 'smooth' }); };
      var go = function (d) { g.goTo(Math.max(0, Math.min(dots.length - 1, idx() + d))); };
      var p = g.querySelector('.prev'), n = g.querySelector('.next');
      if (p) p.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); go(-1); });
      if (n) n.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); go(1); });
    });
  };
  // clicking a card photo opens the car page
  document.addEventListener('click', function (e) {
    var g = e.target.closest && e.target.closest('.car .gal');
    if (!g || e.target.closest('.nav')) return;
    var a = g.parentNode.querySelector('a.body'); if (a) location.href = a.getAttribute('href');
  });
  var BEN = {'אאודי':'Audi','אומודה':'Omoda','אופל':'Opel','אייווייז':'Aiways','אינפיניטי':'Infiniti','איסוזו':'Isuzu','אלפא רומיאו':'Alfa Romeo','אם.ג׳י':'MG','אסטון מרטין':'Aston Martin','אקספנג':'Xpeng','ב.מ.וו':'BMW','בי.ווי.די':'BYD','בנטלי':'Bentley','ג׳אקו':'Jaecoo','ג׳י.דבליו.אם':'GWM','ג׳יאיי':'GAC','ג׳יגואר':'Jaguar','ג׳יילי':'Geely','ג׳יפ':'Jeep','ג׳נסיס':'Genesis','דאצ׳יה':'Dacia','דודג׳':'Dodge','דונגפנג':'Dongfeng','די.אס':'DS','הונגצ׳י':'Hongqi','הונדה':'Honda','וויה':'Voyah','וולוו':'Volvo','זיקר':'Zeekr','טויוטה':'Toyota','טסלה':'Tesla','יונדאי':'Hyundai','ימאהה':'Yamaha','לאנד רובר':'Land Rover','לוטוס':'Lotus','לינק אנד קו':'Lynk & Co','ליפמוטור':'Leapmotor','לקסוס':'Lexus','מאזדה':'Mazda','מזראטי':'Maserati','מיני':'Mini','מיצובישי':'Mitsubishi','מקסוס':'Maxus','מרצדס':'Mercedes-Benz','ניסאן':'Nissan','סאנגיונג / KGM':'KGM SsangYong','סובארו':'Subaru','סוזוקי':'Suzuki','סיאט':'Seat','סיטרואן':'Citroen','סמארט':'Smart','סקודה':'Skoda','סקייוול':'Skywell','פולסטאר':'Polestar','פולקסווגן':'Volkswagen','פורד':'Ford','פורשה':'Porsche','פיאט':'Fiat','פיג׳ו':'Peugeot','צ׳אנגן':'Changan','צ׳רי':'Chery','קאדילק':'Cadillac','קופרה':'Cupra','קיה':'Kia','קרייזלר':'Chrysler','רם':'RAM','רנו':'Renault','שברולט':'Chevrolet'};
  var allBrands = function () { var a = Object.keys(BEN); CARS.forEach(function (c) { if (c.brand && a.indexOf(c.brand) < 0) a.push(c.brand); }); return a.sort(function (x, y) { return x.localeCompare(y, 'he'); }); };
  var brands = function () { var m = {}; CARS.forEach(function (c) { if (c.brand) m[c.brand] = (m[c.brand] || 0) + 1; }); return m; };
  var rail = function (el, list) { el.innerHTML = list.map(card).join(''); wireGal(el); };
  document.querySelectorAll('[data-scroll]').forEach(function (b) {
    b.addEventListener('click', function () { var r = document.getElementById('cars'); if (r) r.scrollBy({ left: -b.dataset.scroll * r.clientWidth * 0.8, behavior: 'smooth' }); });
  });

  // ===== Home =====
  var home = document.querySelector('.home-hero, .h4-hero');
  if (home) {
    var bm = brands();
    var sel = document.getElementById('f-brand');
    allBrands().forEach(function (b) { var o = document.createElement('option'); o.value = b; o.textContent = b + (BEN[b] ? ' ' + BEN[b] : ''); sel.appendChild(o); });
    var sc = document.getElementById('stat-count'); if (sc) sc.textContent = CARS.length;
    var bs0 = document.getElementById('brand-strip'); if (bs0) bs0.innerHTML = Object.keys(bm).sort().map(function (b) { return '<a href="cars.html?brand=' + encodeURIComponent(b) + '">' + esc(b) + (BEN[b] ? ' ' + BEN[b] : '') + '</a>'; }).join('');
    document.querySelectorAll('.cn[data-cat]').forEach(function (s) { var n = CARS.filter(function (c) { return hasCat(c, s.dataset.cat); }).length; s.textContent = n ? n + ' רכבים' : 'בקרוב'; });
    var hero = CARS.filter(function (c) { return c.price; })[0] || CARS[0];
    if (hero) {
      var hc = document.getElementById('hero-car'); if (hc) {
      hc.href = carUrl(hero); hc.querySelector('img').src = pics(hero)[0]; hc.querySelector('img').alt = hero.title + ' ' + hero.year;
      hc.querySelector('.hc-cap b').textContent = hero.title + ' ' + hero.year;
      hc.querySelector('.hc-cap span').textContent = (hero.km ? fmt(hero.km) + ' ק״מ' : '') + (hero.price ? ' · ' + fmt(hero.price) + ' ₪' : ''); }
    }
    var hl = document.getElementById('cars'); rail(hl, CARS.slice(0, +(hl.dataset.limit || CARS.length)));
  }

  // ===== Catalog =====
  var grid = document.querySelector('[data-catalog]');
  if (grid) {
    var $f = function (id) { return document.getElementById(id); };
    var qs = new URLSearchParams(location.search);
    var st = { cat: qs.get('cat') || '', brands: qs.get('brand') ? [qs.get('brand')] : [], max: +qs.get('max') || 0 };
    var bm2 = brands();
    var isNew = function (c) { return c.km === 0; };
    var allB = Object.keys(BEN); Object.keys(bm2).forEach(function (b) { if (allB.indexOf(b) < 0) allB.push(b); });
    $f('f-brands').innerHTML = allB.sort(function (a, b) { return a.localeCompare(b, 'he'); }).map(function (b) { return '<label><input type="checkbox" value="' + esc(b) + '"' + (st.brands.indexOf(b) > -1 ? ' checked' : '') + '> ' + esc(b) + (BEN[b] ? ' <span class="en">' + BEN[b] + '</span>' : '') + '</label>'; }).join('');
    var prices = CARS.map(function (c) { return c.price || 0; });
    var pmax = Math.ceil(Math.max.apply(null, prices.concat([20000])) / 5000) * 5000;
    var maxR = $f('f-max'); maxR.max = pmax; maxR.value = st.max && st.max < pmax ? st.max : pmax;
    var ys = CARS.map(function (c) { return c.year; }).filter(Boolean).sort().filter(function (v, i, a) { return a.indexOf(v) === i; });
    ys.forEach(function (y) { var o = document.createElement('option'); o.value = y; o.textContent = y; $f('f-year').appendChild(o); });
    var pills = document.querySelectorAll('#cat-pills a');
    var render = function () {
      var q = ($f('q').value || '').trim().toLowerCase();
      var bs = [].map.call(document.querySelectorAll('#f-brands input:checked'), function (i) { return i.value; });
      var mx = +maxR.value, yr = +$f('f-year').value || 0, km = +$f('f-km').value || 0;
      $f('max-out').textContent = mx >= pmax ? 'ללא הגבלה' : fmt(mx) + ' ₪';
      var list = CARS.filter(function (c) {
        if (st.cat && !hasCat(c, st.cat)) return false;
        if (bs.length && bs.indexOf(c.brand) < 0) return false;
        var cond = (document.querySelector('#f-cond input:checked') || {}).value || '';
        if (cond === 'new' && !isNew(c)) return false;
        if (cond === 'used' && isNew(c)) return false;
        if (mx < pmax && (!c.price || c.price > mx)) return false;
        if (yr && c.year < yr) return false;
        if (km && (!c.km || c.km > km)) return false;
        if ($f('f-auto').checked && !isAuto(c)) return false;
        if ($f('f-fin').checked && !canFin(c)) return false;
        if (q && (c.title + ' ' + (c.en || '') + ' ' + (c.brand || '') + ' ' + (BEN[c.brand] || '')).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
      var s = $f('sort').value;
      var P = function (c) { return c.price || 1e9; };
      if (s === 'pa') list.sort(function (a, b) { return P(a) - P(b); });
      if (s === 'pd') list.sort(function (a, b) { return (b.price || 0) - (a.price || 0); });
      if (s === 'yd') list.sort(function (a, b) { return b.year - a.year; });
      if (s === 'km') list.sort(function (a, b) { return (a.km || 1e9) - (b.km || 1e9); });
      grid.innerHTML = list.map(card).join(''); wireGal(grid);
      grid.hidden = !list.length; $f('cars-empty').hidden = !!list.length;
      $f('cars-find').hidden = !list.length;
      var want = (bs.join(' / ') + ' ' + ($f('q').value || '')).trim();
      var msg = 'היי KAHLON CARS, אני מחפש/ת רכב' + (want ? ': ' + want : '') + '. אשמח שתעזרו לי למצוא.';
      document.querySelectorAll('.find-wa').forEach(function (w) { w.href = 'https://wa.me/972539666010?text=' + encodeURIComponent(msg); });
      $f('r-count').innerHTML = '<b>' + list.length + '</b> רכבים' + (list.length !== CARS.length ? ' מתוך ' + CARS.length : ' במלאי');
      pills.forEach(function (p) { p.classList.toggle('on', (p.dataset.c || '') === st.cat); });
    };
    pills.forEach(function (p) { p.addEventListener('click', function (e) { e.preventDefault(); st.cat = p.dataset.c; history.replaceState(null, '', p.getAttribute('href')); render(); }); });
    $f('filters').addEventListener('input', render); $f('filters').addEventListener('change', render); $f('sort').addEventListener('change', render);
    $f('f-reset').addEventListener('click', function () { $f('q').value = ''; document.querySelectorAll('#f-brands input').forEach(function (i) { i.checked = false; }); maxR.value = pmax; $f('f-year').value = ''; $f('f-km').value = ''; $f('f-auto').checked = false; var c0 = document.querySelector('#f-cond input[value=""]'); if (c0) c0.checked = true; $f('f-fin').checked = false; st.cat = ''; render(); });
    $f('f-open').addEventListener('click', function () { document.body.classList.add('f-show'); });
    $f('f-done').addEventListener('click', function () { document.body.classList.remove('f-show'); });
    render();
  }

  // ===== Single car page =====
  var cp = document.getElementById('cp');
  if (cp) {
    var id = new URLSearchParams(location.search).get('id');
    var c = CARS.filter(function (x) { return x.id === id; })[0];
    if (!c && !id) c = CARS[0];
    if (!c) { document.getElementById('cp-missing').hidden = false; rail(document.getElementById('similar'), CARS.slice(0, 6)); }
    else {
      document.title = c.title + ' ' + c.year + ' למכירה | Kahlon Cars';
      document.querySelector('#crumbs span').textContent = c.title + ' ' + c.year;
      var p = pics(c);
      var tel = 'tel:+972539666010';
      cp.innerHTML =
        '<div class="cp-media">' + gallery(c, true) +
          (p.length > 1 ? '<div class="thumbs">' + p.map(function (s, k) { return '<button type="button" data-k="' + k + '"' + (k ? '' : ' class="on"') + '><img src="' + s + '" alt=""></button>'; }).join('') + '</div>' : '') +
          '<div class="cp-block"><h2>מפרט</h2><dl class="spec-grid">' + specList(c).map(function (s) { return '<div><dt>' + s[0] + '</dt><dd>' + esc(s[1]) + '</dd></div>'; }).join('') + '</dl></div>' +
          (c.extras && c.extras.length ? '<div class="cp-block"><h2>תוספות</h2><ul class="extras">' + c.extras.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul></div>' : '') +
          (c.note ? '<div class="cp-block"><h2>מצב הרכב</h2><p class="note-line">' + esc(c.note) + '</p></div>' : '') +
        '</div>' +
        '<aside class="cp-side"><div class="cp-box">' +
          '<span class="brand-l">' + esc(c.brand || '') + (c.en ? ' · <span class="ltr">' + esc(c.en) + '</span>' : '') + '</span>' +
          '<h1>' + esc(c.title) + ' <span class="yr">' + c.year + '</span></h1>' +
          '<div class="specs">' + (c.km ? '<span>' + fmt(c.km) + ' ק״מ</span>' : '') + (c.hand ? '<span>יד ' + esc(c.hand) + '</span>' : '') + (c.test ? '<span>טסט ' + esc(c.test) + '</span>' : '') + '</div>' +
          (c.price ? '<div class="price big">' + fmt(c.price) + ' ₪</div>' : '<div class="price price-ask">לפרטים על המחיר דברו איתנו</div>') +
          (canFin(c) && c.price ?
            '<div class="mini-calc"><div class="mc-top"><span>החזר חודשי משוער</span><b id="mc-out"></b></div>' +
            '<label><span>מקדמה: <b id="mc-down-out"></b></span><input id="mc-down" type="range" min="0" max="' + Math.round(c.price * 0.5 / 1000) * 1000 + '" step="1000" value="0"></label>' +
            '<label><span>תשלומים: <b id="mc-n-out"></b></span><input id="mc-n" type="range" min="12" max="100" step="1" value="60"></label></div>'
            : (canFin(c) ? '<div class="tags"><span class="tag tag-fin">מימון עד 100%</span><span class="tag">טרייד־אין</span></div>' : '<div class="tags"><span class="tag">טרייד־אין אפשרי</span></div>')) +
          '<div class="car-actions">' +
            '<a class="btn btn-primary" href="' + wa(msgFor(c)) + '" target="_blank" rel="noopener">' + WA_ICO + 'לפרטים בוואטסאפ</a>' +
            '<a class="btn btn-ghost" href="' + tel + '" target="_blank" rel="noopener">חייגו 053-9666010</a>' +
            (canFin(c) && c.price ? '<a class="btn btn-fin btn-sm" data-car="' + esc(c.title) + '" data-year="' + c.year + '" data-price="' + c.price + '" href="finance.html?car=' + encodeURIComponent(c.title) + '&year=' + c.year + '&price=' + c.price + '#calc">בדיקת מימון מלאה</a>' : '') +
            '<a class="btn btn-sm btn-soft" href="tradein.html?want=' + encodeURIComponent(c.id) + '">יש לי רכב לטרייד־אין</a>' +
          '</div>' +
          (canFin(c) && c.price ? '<p class="note">* להמחשה בלבד. התנאים בפועל נקבעים מול חברת המימון ובכפוף לאישור.</p>' : '') +
        '</div></aside>';
      wireGal(cp);
      var g = cp.querySelector('.gal'), th = cp.querySelectorAll('.thumbs button');
      th.forEach(function (b) { b.addEventListener('click', function () { g.goTo(+b.dataset.k); }); });
      g.addEventListener('slide', function (e) { th.forEach(function (b, j) { b.className = j === e.detail ? 'on' : ''; }); });
      if (document.getElementById('mc-out')) {
        var upd = function () {
          var d = +document.getElementById('mc-down').value, n = +document.getElementById('mc-n').value;
          document.getElementById('mc-down-out').textContent = fmt(d) + ' ₪';
          document.getElementById('mc-n-out').textContent = n;
          document.getElementById('mc-out').textContent = fmt(monthlyPay(c.price - d, n, 7)) + ' ₪';
        };
        cp.querySelectorAll('.mini-calc input').forEach(function (i) { i.addEventListener('input', upd); }); upd();
      }
      var sim = CARS.filter(function (x) { return x !== c; }).map(function (x) {
        var sc = 0; (c.cats || '').split(' ').forEach(function (k) { if (k && hasCat(x, k)) sc += 2; });
        if (x.brand === c.brand) sc += 1; if (c.price && x.price) sc -= Math.abs(x.price - c.price) / 20000;
        return [sc, x];
      }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, 6).map(function (a) { return a[1]; });
      rail(document.getElementById('similar'), sim);
    }
  }

  // ===== Trade-in form =====
  var tf = document.getElementById('trade-form');
  if (tf) {
    var want = document.getElementById('t-want');
    CARS.forEach(function (c) { var o = document.createElement('option'); o.value = c.id; o.textContent = c.title + ' ' + c.year; want.appendChild(o); });
    var w0 = new URLSearchParams(location.search).get('want'); if (w0) want.value = w0;
    tf.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (id) { return (document.getElementById(id).value || '').trim(); };
      var wc = CARS.filter(function (c) { return c.id === want.value; })[0];
      var t = 'היי, אני ' + v('t-name') + ' ואשמח להצעת טרייד־אין.\nהרכב שלי: ' + v('t-model') + (v('t-year') ? ', ' + v('t-year') : '') + (v('t-km') ? ', ' + v('t-km') + ' ק״מ' : '') + (v('t-hand') ? ', יד ' + v('t-hand') : '') + (wc ? '\nמעניין אותי: ' + wc.title + ' ' + wc.year : '');
      window.open(wa(t), '_blank');
    });
  }

  // remember chosen car for the calculator (fallback when the query string is dropped)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.btn-fin');
    if (!a) return;
    try { sessionStorage.setItem('kc-car', JSON.stringify({ car: a.dataset.car, year: a.dataset.year, price: a.dataset.price })); } catch (err) {}
  });

  // Contact form → WhatsApp
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (id) { return (document.getElementById(id).value || '').trim(); };
      var text = 'היי, אני ' + (v('f-name') || '…') + '.\nנושא: ' + v('f-service') +
        (v('f-city') ? '\nעיר: ' + v('f-city') : '') + (v('f-msg') ? '\n' + v('f-msg') : '');
      var href = wa(text);
      var out = document.getElementById('f-out');
      out.hidden = false;
      document.getElementById('f-link').href = href;
      window.location.href = href;
    });
  }
})();

/* ===== Accessibility menu (תפריט נגישות) ===== */
(function () {
  var KEY = 'kc-a11y';
  var st = {};
  try { st = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = {}; }
  var root = document.documentElement;
  var apply = function () {
    root.style.fontSize = st.size ? (100 + st.size * 12.5) + '%' : '';
    ['contrast', 'links', 'font', 'still', 'gray', 'cursor'].forEach(function (k) { root.classList.toggle('a11y-' + k, !!st[k]); });
    document.querySelectorAll('.a11y-panel [data-k]').forEach(function (b) { b.setAttribute('aria-pressed', st[b.dataset.k] ? 'true' : 'false'); });
    var out = document.getElementById('a11y-size'); if (out) out.textContent = (100 + (st.size || 0) * 12.5) + '%';
    try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {}
  };
  var ICO = '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><circle cx="12" cy="4" r="2"/><path d="M19 9.5c0 .6-.4 1-1 1h-4v3.2l2.6 6.1a1 1 0 0 1-1.8.8L12.3 15h-.6l-2.5 5.6a1 1 0 0 1-1.8-.8L10 13.7V10.5H6a1 1 0 1 1 0-2h12c.6 0 1 .4 1 1z"/></svg>';
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'a11y-fab'; btn.innerHTML = ICO;
  btn.setAttribute('aria-label', 'תפריט נגישות'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'a11y-panel');
  var p = document.createElement('div');
  p.id = 'a11y-panel'; p.className = 'a11y-panel'; p.hidden = true;
  p.setAttribute('role', 'dialog'); p.setAttribute('aria-modal', 'false'); p.setAttribute('aria-labelledby', 'a11y-title');
  var t = function (k, label) { return '<button type="button" data-k="' + k + '" aria-pressed="false">' + label + '</button>'; };
  p.innerHTML = '<div class="a11y-top"><h2 id="a11y-title">נגישות</h2><button type="button" class="a11y-x" aria-label="סגירת תפריט הנגישות">×</button></div>' +
    '<div class="a11y-size" role="group" aria-label="גודל טקסט"><span>גודל טקסט <b id="a11y-size">100%</b></span><div><button type="button" data-s="-1" aria-label="הקטנת טקסט">א-</button><button type="button" data-s="1" aria-label="הגדלת טקסט">א+</button></div></div>' +
    '<div class="a11y-grid">' + t('contrast', 'ניגודיות גבוהה') + t('links', 'הדגשת קישורים') + t('font', 'גופן קריא') + t('still', 'עצירת אנימציות') + t('gray', 'גווני אפור') + t('cursor', 'סמן גדול') + '</div>' +
    '<button type="button" class="a11y-reset">איפוס הגדרות</button>' +
    '<a class="a11y-link" href="accessibility.html">הצהרת נגישות</a>';
  document.body.appendChild(btn); document.body.appendChild(p);
  var open = function (v) { p.hidden = !v; btn.setAttribute('aria-expanded', v ? 'true' : 'false'); if (v) p.querySelector('button').focus(); else btn.focus(); };
  btn.addEventListener('click', function () { open(p.hidden); });
  p.querySelector('.a11y-x').addEventListener('click', function () { open(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !p.hidden) open(false); });
  p.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.k) { st[b.dataset.k] = !st[b.dataset.k]; apply(); }
    if (b.dataset.s) { st.size = Math.max(0, Math.min(4, (st.size || 0) + +b.dataset.s)); apply(); }
    if (b.classList.contains('a11y-reset')) { st = {}; apply(); }
  });
  apply();
})();
