document.addEventListener('DOMContentLoaded', function() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    const menuSections = document.querySelectorAll('.menu-section');
    const menuCards = document.querySelectorAll('.menu-card');
    const ingredientsBtns = document.querySelectorAll('.ingredients-btn');
    const header = document.querySelector('.header');
    const categoryNav = document.querySelector('.category-nav');
    const searchToggleBtn = document.querySelector('.search-toggle-btn');
    const searchBarWrap = document.querySelector('.search-bar-wrap');
    const searchInput = document.querySelector('.search-input');
    const searchCloseBtn = document.querySelector('.search-close-btn');
    const dietFilterBtns = document.querySelectorAll('.diet-filter-btn');
    const backToTopBtn = document.querySelector('.back-to-top');

    let currentDietFilter = 'all';

    function getServingInfo(card) {
        const sectionId = card.closest('.menu-section')?.id;
        const defaults = { quantity: '500 g', serves: 'Serves 5' };
        const sectionMap = {
            'starters': { quantity: '500 g', serves: 'Serves 4' },
            'main-course': { quantity: '700 g', serves: 'Serves 5' },
            'pizza': { quantity: '10 inch', serves: 'Serves 3' },
            'burgers': { quantity: '320 g', serves: 'Serves 1' },
            'pasta': { quantity: '450 g', serves: 'Serves 2' },
            'drinks': { quantity: '350 ml', serves: 'Serves 1' },
            'desserts': { quantity: '300 g', serves: 'Serves 2' }
        };
        const base = sectionMap[sectionId] || defaults;
        // Per-dish override: add data-quantity="..." and/or data-serves="..."
        // to any <article class="menu-card"> to show real values for that dish.
        return {
            quantity: card.dataset.quantity || base.quantity,
            serves: card.dataset.serves || base.serves
        };
    }

    function updateStickyHeights() {
        if (header) {
            document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
        }
        if (categoryNav) {
            document.documentElement.style.setProperty('--nav-height', categoryNav.offsetHeight + 'px');
        }
    }

    function syncStickyHeightsAfterLayout() {
        requestAnimationFrame(() => {
            requestAnimationFrame(updateStickyHeights);
        });
    }

    updateStickyHeights();
    window.addEventListener('resize', updateStickyHeights);

    // --- Skeleton image loading ---
    function setupImageSkeleton(imageContainer, img) {
        if (!imageContainer || !img) return;

        const skeleton = document.createElement('div');
        skeleton.className = 'card-skeleton';
        skeleton.setAttribute('aria-hidden', 'true');
        imageContainer.appendChild(skeleton);

        function markLoaded() {
            img.classList.add('is-loaded');
            imageContainer.classList.add('is-loaded');
        }

        if (img.complete && img.naturalWidth > 0) {
            markLoaded();
        } else {
            img.addEventListener('load', markLoaded, { once: true });
            img.addEventListener('error', markLoaded, { once: true });
        }
    }

    // --- Badges ---
    // Curate per dish with data-badge="Chef's Special" (or any text) on a card,
    // or data-no-badge to suppress. If nothing is set, fall back to the old
    // positional default: 1st card = Chef's Special, 2nd = Popular.
    function makeBadge(card, text, className) {
        const imageContainer = card.querySelector('.card-image');
        if (!imageContainer) return;
        const badge = document.createElement('span');
        badge.className = `card-badge ${className}`;
        badge.textContent = text;
        imageContainer.appendChild(badge);
    }

    function badgeClassFor(text) {
        const t = text.toLowerCase();
        if (t.includes('chef')) return 'badge-chefs';
        if (t.includes('popular')) return 'badge-popular';
        return 'badge-popular';
    }

    menuSections.forEach(section => {
        const cards = [...section.querySelectorAll('.menu-card')];

        // 1) Explicit per-dish badges
        cards.forEach(card => {
            if (card.dataset.badge) {
                makeBadge(card, card.dataset.badge, badgeClassFor(card.dataset.badge));
                card.dataset.badged = 'true';
            }
        });

        // 2) Positional defaults for cards that weren't explicitly set/suppressed
        const positional = [
            { index: 0, text: "Chef's Special", className: 'badge-chefs' },
            { index: 1, text: 'Popular', className: 'badge-popular' }
        ];
        positional.forEach(({ index, text, className }) => {
            const card = cards[index];
            if (!card) return;
            if (card.dataset.badged === 'true') return;       // already has an explicit badge
            if (card.dataset.noBadge !== undefined) return;   // suppressed
            makeBadge(card, text, className);
        });
    });

    // --- Card setup: portion meta, flip UI, food type ---
    menuCards.forEach((card, index) => {
        card.classList.add('reveal-ready');
        card.style.setProperty('--stagger-index', (index % 4).toString());

        const foodType = card.querySelector('.food-type');
        if (foodType?.classList.contains('veg')) {
            card.dataset.foodType = 'veg';
            foodType.setAttribute('role', 'img');
            foodType.setAttribute('aria-label', 'Vegetarian');
            foodType.setAttribute('title', 'Vegetarian');
        } else if (foodType?.classList.contains('non-veg')) {
            card.dataset.foodType = 'non-veg';
            foodType.setAttribute('role', 'img');
            foodType.setAttribute('aria-label', 'Non-vegetarian');
            foodType.setAttribute('title', 'Non-vegetarian');
        }

        const description = card.querySelector('.dish-description');
        const footer = card.querySelector('.card-footer');
        if (description && footer && !card.querySelector('.portion-meta')) {
            const servingInfo = getServingInfo(card);
            const meta = document.createElement('div');
            meta.className = 'portion-meta';
            meta.innerHTML = `
                <span class="portion-pill" aria-label="Portion size">
                    <span class="portion-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 4h12"></path>
                            <path d="M8 4v4a4 4 0 0 0 8 0V4"></path>
                            <path d="M6 11h12"></path>
                            <path d="M7 20h10"></path>
                        </svg>
                    </span>
                    <span>${servingInfo.quantity}</span>
                </span>
                <span class="portion-pill" aria-label="Serves people">
                    <span class="portion-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </span>
                    <span>${servingInfo.serves}</span>
                </span>
            `;
            footer.parentNode.insertBefore(meta, footer);
        }

        const imageContainer = card.querySelector('.card-image');
        const ingredientsPanel = card.querySelector('.ingredients-panel');
        if (!imageContainer || !ingredientsPanel) return;

        const img = imageContainer.querySelector('img');

        const flip = document.createElement('div');
        flip.className = 'card-media-flip';

        const front = document.createElement('div');
        front.className = 'card-media-face card-media-front';
        [...imageContainer.children].forEach(child => {
            if (!child.classList.contains('card-badge')) {
                front.appendChild(child);
            }
        });

        const back = document.createElement('div');
        back.className = 'card-media-face card-media-back';
        back.innerHTML = ingredientsPanel.innerHTML;

        flip.appendChild(front);
        flip.appendChild(back);
        imageContainer.appendChild(flip);
        card.classList.add('flip-mode');

        const frontImg = front.querySelector('img');
        setupImageSkeleton(imageContainer, frontImg || img);
    });

    // --- Combined search + diet filter ---
    function applyFilters() {
        const query = (searchInput?.value || '').toLowerCase().trim();

        menuCards.forEach(card => {
            const searchText = card.dataset.search || (card.querySelector('.dish-name')?.textContent || '').toLowerCase();
            const foodType = card.dataset.foodType || '';

            const matchesSearch = !query || searchText.includes(query);
            let matchesDiet = true;
            if (currentDietFilter === 'veg') matchesDiet = foodType === 'veg';
            if (currentDietFilter === 'non-veg') matchesDiet = foodType === 'non-veg';

            card.classList.toggle('filter-hidden', !(matchesSearch && matchesDiet));
        });

        menuSections.forEach(section => {
            const visibleCards = section.querySelectorAll('.menu-card:not(.filter-hidden)');
            section.classList.toggle('section-empty', visibleCards.length === 0);
        });

        let noResultsBanner = document.querySelector('.no-results-banner');
        const anyVisible = [...menuCards].some(card => !card.classList.contains('filter-hidden'));
        const hasActiveFilter = query || currentDietFilter !== 'all';

        if (!anyVisible && hasActiveFilter) {
            if (!noResultsBanner) {
                noResultsBanner = document.createElement('div');
                noResultsBanner.className = 'no-results-banner';
                noResultsBanner.setAttribute('role', 'status');
                document.querySelector('.menu-container')?.prepend(noResultsBanner);
            }
            noResultsBanner.textContent = 'No dishes match your search or filter.';
            noResultsBanner.hidden = false;
        } else if (noResultsBanner) {
            noResultsBanner.hidden = true;
        }
    }

    // --- Search bar toggle ---
    function openSearch() {
        if (!searchBarWrap || !searchToggleBtn) return;
        searchBarWrap.classList.add('is-open');
        searchBarWrap.setAttribute('aria-hidden', 'false');
        searchToggleBtn.setAttribute('aria-expanded', 'true');
        syncStickyHeightsAfterLayout();
        setTimeout(() => searchInput?.focus(), 300);
    }

    function closeSearch() {
        if (!searchBarWrap || !searchToggleBtn) return;
        searchBarWrap.classList.remove('is-open');
        searchBarWrap.setAttribute('aria-hidden', 'true');
        searchToggleBtn.setAttribute('aria-expanded', 'false');
        if (searchInput) {
            searchInput.value = '';
            applyFilters();
        }
        syncStickyHeightsAfterLayout();
    }

    searchBarWrap?.addEventListener('transitionend', (event) => {
        if (event.propertyName === 'max-height' || event.propertyName === 'padding' || event.propertyName === 'padding-bottom') {
            updateStickyHeights();
        }
    });

    searchToggleBtn?.addEventListener('click', () => {
        if (searchBarWrap?.classList.contains('is-open')) {
            closeSearch();
        } else {
            openSearch();
        }
    });

    searchCloseBtn?.addEventListener('click', closeSearch);

    searchInput?.addEventListener('input', applyFilters);

    searchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSearch();
    });

    // --- Diet filter ---
    dietFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dietFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDietFilter = btn.dataset.filter || 'all';
            applyFilters();
        });
    });

    // --- Back to top ---
    function updateBackToTop() {
        if (!backToTopBtn) return;
        backToTopBtn.classList.toggle('visible', window.scrollY > 300);
    }

    window.addEventListener('scroll', updateBackToTop, { passive: true });
    updateBackToTop();

    backToTopBtn?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- Category tab scroll ---
    let isScrollingFromClick = false;
    let scrollTimeout = null;

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                isScrollingFromClick = true;
                clearTimeout(scrollTimeout);

                const offset = (header ? header.offsetHeight : 0) + (categoryNav ? categoryNav.offsetHeight : 0) + 8;
                const targetY = targetSection.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });

                categoryTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                scrollTimeout = setTimeout(() => {
                    isScrollingFromClick = false;
                }, 900);
            }
        });
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40% 0px',
        threshold: 0
    };

    const tabsContainer = document.querySelector('.category-tabs');

    function scrollTabIntoView(tab) {
        if (!tabsContainer || !tab) return;
        const tabLeft = tab.offsetLeft;
        const tabWidth = tab.offsetWidth;
        const containerWidth = tabsContainer.offsetWidth;
        const scrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);
        tabsContainer.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
    }

    function updateActiveTab(sectionId) {
        let activeTab = null;
        categoryTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('href') === '#' + sectionId) {
                tab.classList.add('active');
                activeTab = tab;
            }
        });
        if (activeTab) scrollTabIntoView(activeTab);
    }

    // Pick the section currently sitting under the sticky nav. Works for
    // BOTH scroll directions because it re-evaluates on every frame instead
    // of relying on one-shot "isIntersecting=true" transitions (which can be
    // missed when scrolling up or jumping).
    function pickActiveSectionId() {
        const navHeight = (header ? header.offsetHeight : 0) + (categoryNav ? categoryNav.offsetHeight : 0);
        const probeY = navHeight + 8;
        let activeId = null;
        let fallbackId = null;

        menuSections.forEach(sec => {
            const rect = sec.getBoundingClientRect();
            // Primary: this section straddles the probe line right below the nav.
            if (rect.top <= probeY && rect.bottom > probeY) {
                activeId = sec.id;
            }
            // Fallback: first section whose top is still below the nav
            // (used at the very top of the page before any section is "under" the nav).
            if (!fallbackId && rect.top > navHeight && rect.top < window.innerHeight) {
                fallbackId = sec.id;
            }
        });
        return activeId || fallbackId;
    }

    let scrollRaf = null;
    function onScrollForTabs() {
        if (isScrollingFromClick) return;
        if (scrollRaf !== null) return;
        scrollRaf = requestAnimationFrame(() => {
            scrollRaf = null;
            const id = pickActiveSectionId();
            if (id) {
                const currentActive = document.querySelector('.category-tab.active');
                if (!currentActive || currentActive.getAttribute('href') !== '#' + id) {
                    updateActiveTab(id);
                }
            }
        });
    }

    window.addEventListener('scroll', onScrollForTabs, { passive: true });
    window.addEventListener('resize', onScrollForTabs);
    // Set the right tab on initial load (e.g. if the page is opened scrolled or with a hash).
    onScrollForTabs();

    const cardObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.12
    });

    menuCards.forEach(card => cardObserver.observe(card));

    ingredientsBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.menu-card');
            if (!card) return;

            const isFlipped = card.classList.toggle('flipped');
            this.classList.toggle('active');
            this.setAttribute('aria-pressed', isFlipped ? 'true' : 'false');
        });
    });
});

// Reliable inline fallback image (no external dependency on via.placeholder.com)
const FALLBACK_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#efe6da"/><text x="50%" y="50%" font-family="Poppins,Arial,sans-serif" font-size="22" fill="#9c8c7c" text-anchor="middle" dominant-baseline="middle">The White Root</text></svg>'
);
document.querySelectorAll('img').forEach(img=>{
  img.loading='lazy';
  img.onerror=()=>{ img.onerror=null; img.src=FALLBACK_IMG; };
});
document.querySelectorAll('.menu-card').forEach(card=>{
 const n=card.querySelector('.dish-name')?.textContent||'';
 const d=card.textContent||'';
 card.dataset.search=(n+' '+d).toLowerCase();
});

// --- Dark mode toggle with persistence across visits ---
(function(){
  const toggle = document.getElementById('themeToggle');
  const STORAGE_KEY = 'whiteroot-theme';

  const SUN_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
  const MOON_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';

  function apply(theme){
    const dark = theme === 'dark';
    document.body.classList.toggle('dark-mode', dark);
    if (toggle){
      toggle.innerHTML = dark ? SUN_SVG : MOON_SVG;
      toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch(e){}
  apply(saved === 'dark' ? 'dark' : 'light');

  toggle?.addEventListener('click', () => {
    const nowDark = !document.body.classList.contains('dark-mode');
    apply(nowDark ? 'dark' : 'light');
    try { localStorage.setItem(STORAGE_KEY, nowDark ? 'dark' : 'light'); } catch(e){}
  });
})();
