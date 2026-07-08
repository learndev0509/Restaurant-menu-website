/* =====================================================================
   SMOKE & SAFFRON — Live Menu Loader
   ---------------------------------------------------------------------
   Renders the menu from data instead of hard-coded HTML.

   DATA SOURCE PRIORITY:
     1. Google Sheet (published-to-web CSV) — if settings.sheetCsvUrl is set
     2. menu.json  (same folder)
     3. Embedded fallback JSON inside index.html (works even offline/file://)

   To change the menu: edit the Google Sheet (or menu.json) — no HTML edits.
   See README-MENU.md for the sheet format and setup steps.
   ===================================================================== */
(function () {
  'use strict';
  window.__menuLoaderPresent = true;

  /* ------------------------------------------------------------------ */
  /* small, correct CSV parser (handles quotes, commas, newlines)        */
  /* ------------------------------------------------------------------ */
  function parseCSV(text) {
    var rows = [], row = [], cur = '', inQ = false, i = 0, c;
    text = text.replace(/^\uFEFF/, '');
    while (i < text.length) {
      c = text[i];
      if (inQ) {
        if (c === '"') {
          if (text[i + 1] === '"') { cur += '"'; i += 2; continue; }
          inQ = false; i++; continue;
        }
        cur += c; i++; continue;
      }
      if (c === '"') { inQ = true; i++; continue; }
      if (c === ',') { row.push(cur); cur = ''; i++; continue; }
      if (c === '\r') { i++; continue; }
      if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; i++; continue; }
      cur += c; i++;
    }
    if (cur.length || row.length) { row.push(cur); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (v) { return v.trim() !== ''; }); });
  }

  function truthy(v) {
    v = String(v || '').trim().toLowerCase();
    return v === 'yes' || v === 'true' || v === '1' || v === 'y';
  }

  /* CSV rows -> dishes[] using the header row (same columns as the template) */
  function csvToDishes(text) {
    var rows = parseCSV(text);
    if (rows.length < 2) throw new Error('Sheet has no data rows');
    var head = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    function col(r, name) { var idx = head.indexOf(name); return idx === -1 ? '' : (r[idx] || '').trim(); }
    var dishes = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      var name = col(r, 'name');
      if (!name) continue;
      dishes.push({
        section: (col(r, 'section') || 'other').toLowerCase().replace(/\s+/g, '-'),
        name: name,
        diet: (col(r, 'diet') || 'veg').toLowerCase().indexOf('non') === 0 ? 'non-veg' : 'veg',
        price: parseInt(String(col(r, 'price')).replace(/[^\d]/g, ''), 10) || 0,
        desc: col(r, 'desc'),
        ingredients: col(r, 'ingredients').split('|').map(function (s) { return s.trim(); }).filter(Boolean),
        spicy: truthy(col(r, 'spicy')),
        popular: truthy(col(r, 'popular')),
        img: col(r, 'img'),
        status: (col(r, 'status') || 'active').toLowerCase()
      });
    }
    return dishes;
  }

  /* ------------------------------------------------------------------ */
  /* rendering — markup mirrors the original hard-coded cards exactly    */
  /* ------------------------------------------------------------------ */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var EYE = '<svg class="ic-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  var BACK = '<svg class="ic-back" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-1"/></svg>';
  var QTY_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 4h12"/><path d="M8 4v4a4 4 0 0 0 8 0V4"/><path d="M6 11h12"/><path d="M7 20h10"/></svg>';
  var SRV_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';

  function cardHTML(d, sec) {
    var soldout = d.status === 'soldout';
    var flag = d.popular ? '<span class="dish-flag">\u2605 Popular</span>'
             : d.spicy   ? '<span class="dish-flag">\uD83C\uDF36 Spicy</span>' : '';
    if (soldout) flag = '<span class="dish-flag">Sold out today</span>';
    var mark = d.diet === 'non-veg'
      ? '<span class="veg-mark nonveg" role="img" aria-label="Non-vegetarian"></span>'
      : '<span class="veg-mark" role="img" aria-label="Vegetarian"></span>';
    var ings = (d.ingredients || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
    var qty = d.qty || sec.qty || '', serves = d.serves || sec.serves || '';
    var pills = '';
    if (qty)    pills += '<span class="portion-pill">' + QTY_IC + '<span>' + esc(qty) + '</span></span>';
    if (serves) pills += '<span class="portion-pill">' + SRV_IC + '<span>' + esc(serves) + '</span></span>';

    return '' +
    '<article class="dish-card' + (soldout ? ' soldout' : '') + '" data-diet="' + esc(d.diet) + '" data-qty="' + esc(qty) + '" data-serves="' + esc(serves) + '">' +
      '<div class="dish-media"><div class="dish-flip">' +
        '<div class="dish-face dish-front">' +
          '<img src="' + esc(d.img) + '" alt="' + esc(d.name) + '" loading="lazy" width="400" height="300">' +
          mark + flag +
        '</div>' +
        '<div class="dish-face dish-back" aria-hidden="true"><h4>Ingredients</h4><ul class="ing-chips">' + ings + '</ul></div>' +
      '</div></div>' +
      '<div class="dish-body">' +
        '<div class="dish-top"><h3 class="dish-name">' + esc(d.name) + '</h3>' +
          '<button type="button" class="ingredients-btn" aria-label="Show ingredients for ' + esc(d.name) + '" aria-pressed="false">' + EYE + BACK + '</button></div>' +
        '<p class="dish-desc">' + esc(d.desc) + '</p>' +
        '<div class="portion-meta">' + pills + '</div>' +
        '<div class="dish-foot"><span class="dish-price">\u20B9' + esc(d.price) + '</span></div>' +
      '</div>' +
      '<button type="button" class="details-btn" aria-haspopup="dialog" aria-label="View full details for ' + esc(d.name) + '"><span>Details</span>' + ARROW + '</button>' +
    '</article>';
  }

  function render(menu) {
    var tabsHost = document.getElementById('catTabs');
    var root = document.getElementById('menuRoot');
    if (!tabsHost || !root) return;

    /* group visible dishes by section */
    var bySec = {};
    (menu.dishes || []).forEach(function (d) {
      if (d.status === 'hidden') return;
      (bySec[d.section] = bySec[d.section] || []).push(d);
    });

    /* section order: menu.sections first, then any unknown sections from the sheet */
    var secs = (menu.sections || []).slice();
    Object.keys(bySec).forEach(function (id) {
      if (!secs.some(function (s) { return s.id === id; })) {
        secs.push({ id: id, title: id.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }), emoji: '', menus: 'all', qty: '', serves: '' });
      }
    });

    var tabs = '', body = '';
    secs.forEach(function (sec) {
      var dishes = bySec[sec.id];
      if (!dishes || !dishes.length) return;
      var em = sec.emoji ? '<span class="emoji" aria-hidden="true">' + sec.emoji + '</span>' : '';
      tabs += '<a href="#' + esc(sec.id) + '" class="cat-tab" data-menus="' + esc(sec.menus || 'all') + '">' + (sec.emoji ? sec.emoji + ' ' : '') + esc(sec.title) + '</a>\n';
      body += '<section id="' + esc(sec.id) + '" class="menu-section" data-menus="' + esc(sec.menus || 'all') + '">' +
              '<h2 class="section-title">' + em + esc(sec.title) + '</h2>' +
              '<div class="dish-grid">' + dishes.map(function (d) { return cardHTML(d, sec); }).join('') + '</div>' +
              '</section>';
    });

    tabsHost.innerHTML = tabs;
    root.innerHTML = body;
    document.body.classList.remove('menu-loading');
  }

  /* ------------------------------------------------------------------ */
  /* data source chain                                                   */
  /* ------------------------------------------------------------------ */
  function embedded() {
    var el = document.getElementById('menu-embedded');
    if (!el) return null;
    try { return JSON.parse(el.textContent); } catch (e) { return null; }
  }

  function bust(url) { return url + (url.indexOf('?') === -1 ? '?' : '&') + 't=' + Date.now(); }

  function load() {
    var base = embedded() || { settings: {}, sections: [], dishes: [] };

    /* 1) menu.json (may override settings + everything) */
    fetch(bust('menu.json'), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (json) { proceed(json); })
      .catch(function () { proceed(base); });

    function proceed(menu) {
      var sheetUrl = menu.settings && menu.settings.sheetCsvUrl;
      if (sheetUrl) {
        /* 2) Google Sheet CSV takes over the DISHES (sections meta stays from menu.json) */
        fetch(bust(sheetUrl), { cache: 'no-store' })
          .then(function (r) { if (!r.ok) throw 0; return r.text(); })
          .then(function (txt) {
            try { menu.dishes = csvToDishes(txt); } catch (e) { /* keep menu.json dishes */ }
            finish(menu);
          })
          .catch(function () { finish(menu); });
      } else {
        finish(menu);
      }
    }

    function finish(menu) {
      try { render(menu); } catch (e) { /* leave loading state; init anyway */ }
      if (typeof window.__initMenu === 'function') window.__initMenu();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
