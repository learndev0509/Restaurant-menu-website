/* =====================================================================
   SMOKE & SAFFRON — Digital Menu
   No language toggle. Guest-facing interactions only.
   ===================================================================== */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  document.addEventListener('DOMContentLoaded', function () {
    const header       = document.querySelector('.site-header');
    const catNav       = document.querySelector('.cat-nav');
    const catTabs      = [...document.querySelectorAll('.cat-tab')];
    const tabsScroller = document.querySelector('.cat-tabs');
    const sections     = [...document.querySelectorAll('.menu-section')];
    const cards        = [...document.querySelectorAll('.dish-card')];

    const searchToggle = document.querySelector('.search-toggle');
    const searchPanel  = document.querySelector('.search-panel');
    const searchInput  = document.querySelector('.search-input');
    const searchClear  = document.querySelector('.search-clear');
    const backToTop    = document.querySelector('.back-to-top');
    const menuWrap     = document.querySelector('.menu');

    let currentDiet = 'all';   // default: full menu (Veg-only switch off)

    /* ---- Build search indices per card ---- */
    /* dataset.search      = dish name + description (visible front text)
       dataset.ingredients = the ingredient chips only (not the heading/pills/price) */
    cards.forEach(card => {
      const name = card.querySelector('.dish-name')?.textContent || '';
      const desc = card.querySelector('.dish-desc')?.textContent || '';
      const ings = [...card.querySelectorAll('.ing-chips li')].map(li => li.textContent).join(' ');
      card.dataset.search = (name + ' ' + desc).replace(/\s+/g, ' ').trim().toLowerCase();
      card.dataset.ingredients = ings.replace(/\s+/g, ' ').trim().toLowerCase();
    });

    /* ---- Image fallback (works even if a photo URL 404s) ---- */
    const FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">' +
      '<rect width="400" height="300" fill="#3a1c0e"/>' +
      '<text x="50%" y="50%" font-family="Arial,sans-serif" font-size="20" fill="#ffb44d" ' +
      'text-anchor="middle" dominant-baseline="middle">Smoke &amp; Saffron</text></svg>'
    );
    document.querySelectorAll('.dish-media img').forEach(img => {
      img.addEventListener('error', function handle() {
        img.removeEventListener('error', handle);
        img.src = FALLBACK;
      });
    });

    /* ---- Reveal cards on scroll ---- */
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
      cards.forEach(c => io.observe(c));
    } else {
      cards.forEach(c => c.classList.add('is-visible'));
    }

    /* ---- Inline ingredients expand (eye/▸ button) ---- */
    function setExpand(card, open) {
      card.classList.toggle('expanded', open);
      const btn = card.querySelector('.ingredients-btn');
      if (btn) {
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.setAttribute('aria-label', (open ? 'Hide details for ' : 'Show details for ') + (card.querySelector('.dish-name')?.textContent || 'dish'));
      }
    }
    document.addEventListener('click', e => {
      const btn = e.target.closest('.ingredients-btn');
      if (!btn) return;
      e.stopPropagation();
      const card = btn.closest('.dish-card');
      if (card) setExpand(card, !card.classList.contains('expanded'));
    });


    /* ---- Search + diet filters ---- */
    function applyFilters() {
      const q = (searchInput?.value || '').trim().toLowerCase();
      cards.forEach(card => {
        const inName    = (card.dataset.search || '').includes(q);
        const inIng     = (card.dataset.ingredients || '').includes(q);
        const matchQ    = !q || inName || inIng;
        const diet      = card.dataset.diet || '';
        const matchDiet = currentDiet === 'all' || diet === currentDiet;
        const show      = matchQ && matchDiet;
        card.classList.toggle('filter-hidden', !show);

        // Auto-expand a card that matched ONLY on an ingredient, so it's clear why.
        const wantOpen = !!q && show && inIng && !inName;
        if (wantOpen && !card.classList.contains('expanded')) {
          setExpand(card, true); card.dataset.autoexpand = '1';
        } else if (!wantOpen && card.dataset.autoexpand === '1') {
          setExpand(card, false); delete card.dataset.autoexpand;
        }
      });
      sections.forEach(sec => {
        const visible = sec.querySelectorAll('.dish-card:not(.filter-hidden)').length;
        sec.classList.toggle('section-empty', visible === 0);
      });
      // Global "no results" message
      const anyVisible = cards.some(c => !c.classList.contains('filter-hidden'));
      let banner = document.querySelector('.no-results');
      if (!anyVisible) {
        if (!banner) {
          banner = document.createElement('p');
          banner.className = 'no-results';
          banner.textContent = 'No dishes match your search. Try another word or clear the filters.';
          menuWrap?.prepend(banner);
        }
      } else if (banner) {
        banner.remove();
      }
    }

    searchInput?.addEventListener('input', applyFilters);
    searchInput?.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });

    /* ---- Veg-only switch (header) ---- */
    const vegSwitch = document.getElementById('vegSwitch');
    vegSwitch?.addEventListener('click', () => {
      const on = vegSwitch.getAttribute('aria-checked') !== 'true';
      vegSwitch.setAttribute('aria-checked', on ? 'true' : 'false');
      currentDiet = on ? 'veg' : 'all';
      applyFilters();
    });

    /* ---- Keep the sticky category bar below the (search-aware) header ---- */
    const headerInner = document.querySelector('.header-inner');
    const searchInner = document.querySelector('.search-panel-inner');
    function syncCatTop() {
      const open = searchPanel?.classList.contains('is-open');
      const h = (headerInner?.offsetHeight || 0) + (open ? (searchInner?.offsetHeight || 0) : 0);
      document.documentElement.style.setProperty('--cat-top', h + 'px');
    }
    syncCatTop();
    window.addEventListener('resize', syncCatTop);

    /* ---- Search panel open/close ---- */
    function openSearch() {
      searchPanel?.classList.add('is-open');
      searchToggle?.setAttribute('aria-expanded', 'true');
      syncCatTop();
      setTimeout(() => searchInput?.focus(), 120);
    }
    function closeSearch() {
      searchPanel?.classList.remove('is-open');
      searchToggle?.setAttribute('aria-expanded', 'false');
      syncCatTop();
      if (searchInput) { searchInput.value = ''; applyFilters(); }
    }
    searchToggle?.addEventListener('click', () => {
      searchPanel?.classList.contains('is-open') ? closeSearch() : openSearch();
    });
    searchClear?.addEventListener('click', closeSearch);


    /* ---- Sticky-nav offset helper ---- */
    function navOffset() {
      return (header?.offsetHeight || 0) + (catNav?.offsetHeight || 0) + 8;
    }

    /* ---- Controlled smooth scroll (consistent glide on every browser/phone) ---- */
    let clickLock = false, scrollAnim = null;
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function smoothScrollTo(targetY) {
      targetY = Math.max(0, Math.round(targetY));
      const startY = window.pageYOffset;
      const dist = targetY - startY;
      if (Math.abs(dist) < 2) { clickLock = false; return; }
      if (reducedMotion) { window.scrollTo(0, targetY); clickLock = false; return; }
      const duration = Math.min(820, Math.max(420, Math.abs(dist) * 0.42));
      const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      let startTime = null;
      if (scrollAnim) cancelAnimationFrame(scrollAnim);
      clickLock = true;
      function step(now) {
        if (startTime === null) startTime = now;
        const p = Math.min(1, (now - startTime) / duration);
        window.scrollTo(0, Math.round(startY + dist * ease(p)));
        if (p < 1) { scrollAnim = requestAnimationFrame(step); }
        else { scrollAnim = null; clickLock = false; }
      }
      scrollAnim = requestAnimationFrame(step);
    }

    /* Pre-reveal a section's cards so they don't pop in on arrival */
    function revealSection(sec) {
      sec && sec.querySelectorAll('.dish-card').forEach(c => c.classList.add('is-visible'));
    }

    /* ---- Category tab click → smooth scroll ---- */
    catTabs.forEach(tab => {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.getElementById(this.getAttribute('href').slice(1));
        if (!target) return;
        catTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        revealSection(target);
        smoothScrollTo(target.getBoundingClientRect().top + window.pageYOffset - navOffset());
      });
    });

    /* ---- Scroll-spy (rAF, works both directions) ---- */
    function centerTab(tab) {
      if (!tabsScroller || !tab) return;
      const left = tab.offsetLeft - (tabsScroller.offsetWidth / 2) + (tab.offsetWidth / 2);
      tabsScroller.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    }
    function activeSectionId() {
      const probe = navOffset();
      let id = null, fallback = null;
      sections.forEach(sec => {
        if (sec.classList.contains('section-empty')) return;
        const r = sec.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) id = sec.id;
        if (fallback === null && r.top > probe && r.top < window.innerHeight) fallback = sec.id;
      });
      return id || fallback;
    }
    let raf = null;
    function onScroll() {
      if (clickLock || raf !== null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const id = activeSectionId();
        if (!id) return;
        const cur = document.querySelector('.cat-tab.active');
        if (!cur || cur.getAttribute('href') !== '#' + id) {
          catTabs.forEach(t => t.classList.remove('active'));
          const tab = catTabs.find(t => t.getAttribute('href') === '#' + id);
          if (tab) { tab.classList.add('active'); centerTab(tab); }
        }
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    /* ---- Back to top ---- */
    function toggleTop() { backToTop?.classList.toggle('visible', window.scrollY > 320); }
    window.addEventListener('scroll', toggleTop, { passive: true });
    toggleTop();
    backToTop?.addEventListener('click', () => smoothScrollTo(0));
  });


  /* ---- Live open / closed hours ---- */
  (function () {
    function refresh() {
      const el = document.getElementById('liveHours');
      if (!el) return;
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      const open = (mins >= 11*60 && mins < 15*60) || (mins >= 19*60 && mins < 24*60);
      el.classList.toggle('is-open', open);
      el.classList.toggle('is-closed', !open);
      el.innerHTML = open
        ? '<span class="dot"></span>Open now · till ' + (mins < 15*60 ? '3pm' : 'midnight')
        : '<span class="dot"></span>Closed · opens ' + (mins < 11*60 ? '11am' : (mins < 19*60 ? '7pm' : '11am'));
    }
    refresh();
    setInterval(refresh, 60000);
  })();

  /* ---- Dark mode (persisted; degrades gracefully if storage blocked) ---- */
  (function () {
    const KEY = 'smokesaffron-theme';
    const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/></svg>';
    const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';

    function apply(dark) {
      document.body.classList.toggle('dark-mode', dark);
      const btn = document.getElementById('themeToggle');
      if (btn) {
        btn.innerHTML = dark ? SUN : MOON;
        btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      }
    }
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    // First load respects saved choice, else the device preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    apply(saved ? saved === 'dark' : prefersDark);

    document.addEventListener('DOMContentLoaded', () => {
      apply(document.body.classList.contains('dark-mode'));
      document.getElementById('themeToggle')?.addEventListener('click', () => {
        const dark = !document.body.classList.contains('dark-mode');
        apply(dark);
        try { localStorage.setItem(KEY, dark ? 'dark' : 'light'); } catch (e) {}
      });
    });
  })();
})();
